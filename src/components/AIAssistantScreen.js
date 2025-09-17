import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles } from 'lucide-react';

const AIAssistantScreen = ({ files = [] }) => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Hi! Ask me anything about your files — counts, trends, largest files, earnings, recent updates, and more.' }
  ]);
  const [input, setInput] = useState('');

  const stats = useMemo(() => {
    const total = files.length;
    const byStatus = files.reduce((acc, f) => { acc[f.status] = (acc[f.status] || 0) + 1; return acc; }, {});
    const byType = files.reduce((acc, f) => { const t = f.type || 'Other'; acc[t] = (acc[t] || 0) + 1; return acc; }, {});
    const totalEarnings = files.reduce((sum, f) => sum + (Number(f.earnings) || 0), 0);
    const recent = [...files].filter(f => f.date).sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    const largest = [...files].map(f => ({...f, _size: parseFloat(String(f.size||'0').replace(/[^0-9.]/g,''))||0 }))
      .sort((a,b) => b._size - a._size)[0];
    return { total, byStatus, byType, totalEarnings, recent, largest };
  }, [files]);

  const replyFor = (q) => {
    const query = (q || '').toLowerCase();
    const { total, byStatus, byType, totalEarnings, recent, largest } = stats;

    if (/(how many|count|total).*file/.test(query)) {
      return `You have ${total} files: ${byStatus.private||0} private, ${byStatus.shared||0} shared, and ${byStatus.earned||0} that earned.`;
    }
    if (/shared|privacy|private/.test(query)) {
      return `Privacy breakdown — Private: ${byStatus.private||0}, Shared: ${byStatus.shared||0}. You can revoke sharing anytime from a file’s details.`;
    }
    if (/type|category|imaging|lab|note|genomic|cardio|breakdown/.test(query)) {
      const parts = Object.entries(byType).map(([t,c]) => `${t}: ${c}`).join(', ');
      return `By type — ${parts || 'No types found'}.`;
    }
    if (/earn|payout|money|balance/.test(query)) {
      return `Total earnings from files: $${totalEarnings.toFixed(2)}. Files with earnings: ${(byStatus.earned||0)}.`;
    }
    if (/recent|latest|update/.test(query)) {
      if (!recent.length) return 'No recent updates yet.';
      const lines = recent.map(f => `• ${f.date} — ${f.name} (${f.type})`).join('\n');
      return `Latest updates:\n${lines}`;
    }
    if (/largest|biggest|size/.test(query) && largest) {
      return `Largest file is ${largest.name} at ${largest.size || '—'} (${largest.type}).`;
    }
    if (/suggest|which|share|recommend/.test(query)) {
      // naive suggestion: suggest sharing imaging and lab first
      return 'Suggestion: Share non-identifying results first (Lab/Imaging summaries). Keep raw clinical notes private until needed. You can toggle per file in Files → details.';
    }
    // Default: compact summary
    const topTypes = Object.entries(byType).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t,c])=>`${t} (${c})`).join(', ');
    return `Summary — ${total} files, $${totalEarnings.toFixed(2)} earned. Top types: ${topTypes||'—'}. Ask things like “latest updates”, “type breakdown”, or “largest file”.`;
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), role: 'user', text };
    const botMsg = { id: Date.now()+1, role: 'assistant', text: replyFor(text) };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const quickPrompts = [
    'How many files do I have?',
    'Show type breakdown',
    'What changed recently?',
    'Which file is largest?',
    'How much have I earned?'
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-6 py-6 flex items-center space-x-2">
        <Bot className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold text-gray-900">AI Insights</h1>
        <span className="ml-auto text-xs text-gray-500 flex items-center space-x-1"><Sparkles className="w-4 h-4" /><span>demo</span></span>
      </div>

      {/* Quick prompts */}
      <div className="px-6 mb-3 flex flex-wrap gap-2">
        {quickPrompts.map((p) => (
          <button key={p} onClick={() => { setInput(p); }} className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 text-xs hover:bg-gray-100">
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="px-6 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role==='user' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800 border border-gray-100'}`}>
              <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[375px] px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-2 flex items-center space-x-2 elev-2">
          <input
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter') send(); }}
            className="flex-1 px-3 py-2 outline-none"
            placeholder="Ask about your files…"
            aria-label="Ask AI about your files"
          />
          <button onClick={send} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantScreen;


