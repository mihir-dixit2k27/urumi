import express from 'express';
import cors from 'cors';
// @ts-ignore
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import axios from 'axios';
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
// Dummy Auth Middleware for demonstration
async function authMiddleware(req, res, next) {
    const apiKey = req.headers['authorization']?.replace('Bearer ', '');
    if (!apiKey)
        return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { apiKey } });
    if (!user)
        return res.status(401).json({ error: 'Invalid API Key' });
    req.user = user;
    next();
}
app.post('/mcp', authMiddleware, async (req, res) => {
    const user = req.user;
    const body = req.body;
    const method = body.method;
    if (method === 'tools/list') {
        const servers = await prisma.upstreamServer.findMany();
        let allTools = [];
        // Fan out requests with timeouts
        const promises = servers.map(async (server) => {
            try {
                const response = await axios.post(server.url, { jsonrpc: '2.0', id: 1, method: 'tools/list' }, {
                    timeout: 5000,
                    headers: {
                        'Mcp-Method': 'tools/list',
                        'Origin': 'http://gateway',
                        ...(server.token ? { 'Authorization': `Bearer ${server.token}` } : {})
                    }
                });
                const tools = response.data.result?.tools || [];
                // Namespace rewrite
                tools.forEach((t) => {
                    t.name = `${server.name}_${t.name}`;
                });
                return tools;
            }
            catch (err) {
                console.error(`Failed to fetch tools from ${server.name}`, err);
                return []; // Do not break aggregation
            }
        });
        const results = await Promise.all(promises);
        results.forEach((tools) => allTools = allTools.concat(tools));
        return res.json({ jsonrpc: '2.0', id: body.id, result: { tools: allTools } });
    }
    if (method === 'tools/call') {
        const originalName = body.params.name;
        // Map back to server
        const prefixMatch = originalName.match(/^([a-zA-Z0-9_-]+)_(.*)$/);
        if (!prefixMatch)
            return res.json({ jsonrpc: '2.0', id: body.id, error: { code: -32602, message: 'Invalid tool namespace' } });
        const serverName = prefixMatch[1];
        const actualToolName = prefixMatch[2];
        const server = await prisma.upstreamServer.findUnique({ where: { name: serverName } });
        if (!server)
            return res.json({ jsonrpc: '2.0', id: body.id, error: { code: -32602, message: `Unknown server: ${serverName}` } });
        const start = Date.now();
        let outcome = 'success';
        let upstreamResponse;
        try {
            const reqBody = {
                jsonrpc: '2.0',
                id: body.id,
                method: 'tools/call',
                params: {
                    name: actualToolName,
                    arguments: body.params.arguments
                }
            };
            const response = await axios.post(server.url, reqBody, {
                timeout: 30000,
                headers: {
                    'Mcp-Method': 'tools/call',
                    'Origin': 'http://gateway',
                    ...(server.token ? { 'Authorization': `Bearer ${server.token}` } : {})
                }
            });
            upstreamResponse = response.data;
            if (upstreamResponse.error) {
                outcome = 'protocol_error';
            }
            else if (upstreamResponse.result?.isError) {
                outcome = 'tool_error';
            }
        }
        catch (err) {
            outcome = 'protocol_error';
            upstreamResponse = { jsonrpc: '2.0', id: body.id, error: { code: -32603, message: 'Gateway Upstream Error: ' + err.message } };
        }
        const durationMs = Date.now() - start;
        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                serverId: server.id,
                tool: actualToolName,
                durationMs,
                outcome
            }
        });
        return res.json(upstreamResponse);
    }
    return res.json({ jsonrpc: '2.0', id: body.id, error: { code: -32601, message: 'Method not supported by gateway' } });
});
// Admin endpoints
app.post('/admin/servers', async (req, res) => {
    // missing auth logic
    const { name, url, token } = req.body;
    const server = await prisma.upstreamServer.create({ data: { name, url, token } });
    res.json(server);
});
app.get('/admin/logs', async (req, res) => {
    const logs = await prisma.auditLog.findMany({ include: { user: true, server: true }, orderBy: { id: 'desc' } });
    res.json(logs);
});
app.listen(PORT, () => console.log(`Gateway listening on port ${PORT}`));
