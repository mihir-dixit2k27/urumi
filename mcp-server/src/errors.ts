import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

interface ToolErrorResult {
    content: Array<{ type: string; text: string }>;
    isError: true;
}

// Helper to create a ToolExecutionError
export function createToolError(message: string): ToolErrorResult {
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
export function createProtocolError(code: ErrorCode, message: string): McpError {
    return new McpError(code, message);
}
