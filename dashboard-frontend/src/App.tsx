import { useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { ChatAgent } from './components/ChatAgent';

function App() {
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const apiKey = "demo_api_key_123";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Control Plane Dashboard</h1>
          <div className="flex bg-[#e2e8f0] p-1 rounded shadow-inner w-fit">
            <button
              onClick={() => setRole('admin')}
              className={`px-4 py-2 text-sm font-medium rounded transition-all ${role === 'admin' ? 'bg-white shadow text-[#0f172a]' : 'text-slate-600 hover:text-slate-900'}`}>
              Administrator View
            </button>
            <button
              onClick={() => setRole('member')}
              className={`px-4 py-2 text-sm font-medium rounded transition-all ${role === 'member' ? 'bg-white shadow text-[#0f172a]' : 'text-slate-600 hover:text-slate-900'}`}>
              Agent Operative View
            </button>
          </div>
        </header>

        <main>
          {role === 'admin' ? (
            <AdminPanel />
          ) : (
            <ChatAgent apiKey={apiKey} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
