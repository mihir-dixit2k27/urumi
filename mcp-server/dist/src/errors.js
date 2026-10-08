import { McpError } from "@modelcontextprotocol/sdk/types.js";
// Helper to create a ToolExecutionError
export function createToolError(message) {
    return {
        content: [
            {
                type: "text",
                text: `Tool Execution Error: ${message}`
            }
        ],
        isError: true
    };
}
// Protocol Error is a standard McpError
export function createProtocolError(code, message) {
    return new McpError(code, message);
}
