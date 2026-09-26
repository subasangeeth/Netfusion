import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
  RefreshCw,
  Search,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';

const QUICK_PROMPTS = [
  "Why can't the on-prem server reach the AWS application?",
  "Check WireGuard VPN handshake and tunnel metrics",
  "Analyze recent Suricata intrusion alerts",
  "Verify on-premise router and firewall status"
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Hello! I am NetFusion AI Assistant. I use strictly allowlisted diagnostic tools to inspect your Docker on-premises network, WireGuard VPN tunnel, and AWS Cloud infrastructure. How can I assist your operations today?",
      tools: [],
      evidence: [],
      causes: [],
      remediation: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAi(query);
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        text: res.reply,
        tools: res.executed_tools || [],
        evidence: res.observed_evidence || [],
        causes: res.possible_causes || [],
        remediation: res.recommended_remediation || []
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: "I encountered an error executing diagnostic tools. Please verify the NetFusion backend is reachable.",
          tools: [],
          evidence: [],
          causes: [],
          remediation: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">NETFUSION AI ASSISTANT</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ALLOWLISTED TOOLS ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated root-cause analysis across On-Premises, VPN, AWS Route Tables, and Suricata telemetry with strict safety boundaries.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">Quick Diagnostics:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 font-sans text-xs transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Conversation Thread */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 min-h-[480px] max-h-[640px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-xl text-xs space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white font-sans'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                {/* Executed Tools Badge */}
                {msg.tools && msg.tools.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400">Allowlisted Tools Called:</span>
                    {msg.tools.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30"
                      >
                        {t}()
                      </span>
                    ))}
                  </div>
                )}

                {/* Remediation Cards */}
                {msg.remediation && msg.remediation.length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-emerald-200">
                    <div className="font-bold flex items-center gap-1 text-[11px] text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Recommended Safe Remediation</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {msg.remediation.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400 font-mono">
              <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Querying allowlisted network and AWS tools...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-800"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a diagnostic question (e.g. 'Why can't onprem server reach AWS?')"
            className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-glow-cyan"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
