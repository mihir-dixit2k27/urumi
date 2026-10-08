import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { WooCommerceService } from './woocommerce.js';
import { createToolError, createProtocolError } from './errors.js';

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use(cors());
app.use(express.json());

const wcService = new WooCommerceService();

const TOOLS = [
    {
        name: "list_products",
        description: "Retrieves a paginated array of product objects.",
        inputSchema: {
            type: "object",
            properties: { page: { type: "integer", default: 1 }, per_page: { type: "integer", default: 10 } },
            additionalProperties: false
        }
    },
    {
        name: "create_product",
        description: "Creates a new catalog item.",
        inputSchema: {
            type: "object",
            properties: { name: { type: "string" }, type: { type: "string" }, regular_price: { type: "string" } },
            required: ["name", "type", "regular_price"],
            additionalProperties: false
        }
    },
    {
        name: "list_orders",
        description: "Retrieves recent transactions, optionally bounded by time.",
        inputSchema: {
            type: "object",
            properties: { page: { type: "integer", default: 1 }, per_page: { type: "integer", default: 10 }, before: { type: "string" }, after: { type: "string" } },
            additionalProperties: false
        }
    },
    {
        name: "get_order",
        description: "Fetches the full schema of a specific transaction.",
        inputSchema: {
            type: "object",
            properties: { id: { type: "integer" } },
            required: ["id"],
            additionalProperties: false
        }
    },
    {
        name: "update_order_status",
        description: "Modifies transaction states.",
        inputSchema: {
            type: "object",
            properties: { id: { type: "integer" }, status: { type: "string" } },
            required: ["id", "status"],
            additionalProperties: false
        }
    }
];

app.post('/mcp', async (req: Request, res: Response) => {
    const origin = req.get('Origin');
    if (ALLOWED_ORIGIN !== '*' && origin !== ALLOWED_ORIGIN) {
        res.status(403).json({ error: "Forbidden: Origin Validation Failed" });
        return;
    }

    const mcpMethod = req.get('Mcp-Method');
    if (mcpMethod) {
        console.log(`[Streamable HTTP] Emulating method: ${mcpMethod}`);
    }

    const msg = req.body;
    let result: any, errorResponse: any;

    if (msg.method === "tools/list") {
        result = { tools: TOOLS };
    } else if (msg.method === "tools/call") {
        const name = msg.params.name;
        const args = msg.params.arguments || {};
        try {
            let resultData: any;
            if (name === 'list_products') {
                resultData = await wcService.listProducts(args.page, args.per_page);
            } else if (name === 'create_product') {
                resultData = await wcService.createProduct(args.name, args.type, args.regular_price);
            } else if (name === 'list_orders') {
                resultData = await wcService.listOrders(args.page, args.per_page, args.before, args.after);
            } else if (name === 'get_order') {
                resultData = await wcService.getOrder(args.id);
            } else if (name === 'update_order_status') {
                resultData = await wcService.updateOrderStatus(args.id, args.status);
            } else {
                throw createProtocolError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }

            result = {
                content: [{ type: "text", text: JSON.stringify(resultData, null, 2) }]
            };
        } catch (e: any) {
            if (e instanceof McpError) {
                errorResponse = { code: e.code, message: e.message };
            } else {
                // Tool Error logic mapping as dictated
                result = createToolError(e.message || "Unknown business logic failure");
            }
        }
    } else {
        errorResponse = { code: ErrorCode.MethodNotFound, message: "Method not found" };
    }

    if (errorResponse) {
        res.json({ jsonrpc: "2.0", id: msg.id, error: errorResponse });
    } else {
        res.json({ jsonrpc: "2.0", id: msg.id, result: result });
    }
});

app.listen(PORT, () => {
    console.log(`WooCommerce MCP Server (Streamable HTTP Protocol compliant) listening on port ${PORT}`);
});
