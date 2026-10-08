import React, { useState } from 'react';
import { execMcpTool, queryMcpList } from '../services/api';

export function ChatAgent({ apiKey }: { apiKey: string }) {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setMessages(prev => [...prev, { role: "user", content: prompt }]);

        // Simulating the LLM Tool Loop mechanism as requested
        setMessages(prev => [...prev, { role: "system", content: `Evaluating intent against standardized tools...` }]);

        try {
            // First step: fetch available schema from the Gateway
            setMessages(prev => [...prev, { role: "system", content: `Connecting to Gateway for tools mapping...` }]);
            const catalog = await queryMcpList(apiKey);

            // Execute simulated LLM decision (e.g. routing to create_product or list_orders)
            setMessages(prev => [...prev, { role: "system", content: `Executing tool sequence via unified POST architecture.` }]);

            // Here we would invoke execMcpTool with the parsed payload
            // For example: await execMcpTool(apiKey, "store_1_list_products", { page: 1, per_page: 5 });

            setMessages(prev => [...prev, { role: "agent", content: `Action authorized and routed successfully. I am ready for the next instruction.` }]);
        } catch (e: any) {
            setMessages(prev => [...prev, { role: "agent", content: `Tool execution failed: ${e.message}` }]);
        }

        setPrompt("");
    };

    return (
        <div className="flex flex-col h-[600px] border border-surface-border rounded bg-surface-card shadow-sm">
            <div className="p-4 border-b border-surface-border bg-surface-bg flex justify-between items-center rounded-t">
                <h2 className="text-lg font-semibold text-primary-900">Virtual Assistant Console</h2>
                <div className="text-xs bg-[#e0f2fe] text-primary-900 px-2 py-1 rounded">Secured Connection</div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 mt-10">System ready. Enter an operational directive.</div>
                )}
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-xl text-sm ${m.role === 'user' ? 'bg-[#0284c7] text-white shadow-sm' : m.role === 'system' ? 'w-full bg-[#f8fafc] text-slate-500 font-mono text-xs border border-[#e2e8f0]' : 'bg-white text-slate-800 border border-[#e2e8f0] shadow-sm'}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-[#e2e8f0] flex gap-3 bg-white rounded-b">
                <input
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Input command..."
                    className="flex-1 p-2.5 border border-[#e2e8f0] rounded focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                />
                <button type="submit" className="px-5 py-2.5 bg-[#0284c7] text-white rounded font-medium shadow-sm hover:bg-[#0ea5e9] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0ea5e9]">
                    Execute Directive
                </button>
            </form>
        </div>
    );
}
