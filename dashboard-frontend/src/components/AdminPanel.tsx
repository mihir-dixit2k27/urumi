import { useState, useEffect } from 'react';
import { fetchLogs } from '../services/api';

export function AdminPanel() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;
        fetchLogs().then(data => {
            if (mounted) setLogs(Array.isArray(data) ? data : []);
        }).catch(() => console.error("Failed fetching logs for admin panel"));
        return () => { mounted = false; };
    }, []);

    return (
        <div className="p-6 bg-surface-card rounded shadow border border-surface-border">
            <h2 className="text-xl font-semibold mb-4 text-primary-900">Platform Audit Logs</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-[#f0f9ff]">
                        <tr>
                            <th className="p-3 font-semibold text-primary-900">User ID</th>
                            <th className="p-3 font-semibold text-primary-900">Server ID</th>
                            <th className="p-3 font-semibold text-primary-900">Tool Executed</th>
                            <th className="p-3 font-semibold text-primary-900">Outcome</th>
                            <th className="p-3 font-semibold text-primary-900">Execution (ms)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log: any) => (
                            <tr key={log.id} className="border-t border-surface-border hover:bg-slate-50">
                                <td className="p-3 font-mono">{log.userId}</td>
                                <td className="p-3 font-mono">{log.serverId}</td>
                                <td className="p-3 font-mono text-primary-600">{log.tool}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs ${log.outcome === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {log.outcome}
                                    </span>
                                </td>
                                <td className="p-3">{log.durationMs}ms</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-6 text-center text-slate-500">No telemetry logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
