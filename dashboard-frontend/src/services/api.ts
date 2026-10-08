import axios from 'axios';

const GATEWAY_URL = 'http://localhost:4000'; // Will be mapped to actual ingress/internal DNS dynamically in prod

export const api = axios.create({
    baseURL: GATEWAY_URL
});

export const fetchLogs = async () => (await api.get('/admin/logs')).data;

export const queryMcpList = async (apiKey: string) => {
    const res = await api.post('/mcp', { jsonrpc: '2.0', id: 1, method: 'tools/list' }, { headers: { Authorization: `Bearer ${apiKey}` } });
    return res.data;
};

export const execMcpTool = async (apiKey: string, tool: string, args: any) => {
    const res = await api.post('/mcp', { jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name: tool, arguments: args } }, { headers: { Authorization: `Bearer ${apiKey}` } });
    return res.data;
};
