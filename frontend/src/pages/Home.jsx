import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateProject } from '../lib/api';
import { Terminal } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const { session_id } = await generateProject(prompt);
      navigate(`/dashboard/${session_id}`);
    } catch (e) {
      alert("Error starting session: " + e.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0D1117] text-[#c9d1d9]">
      <div className="flex items-center gap-3 mb-8">
        <Terminal className="w-12 h-12 text-primary" />
        <h1 className="text-4xl font-extrabold tracking-tight">Antigravity<span className="text-primary">AI</span></h1>
      </div>
      <p className="text-lg text-gray-400 max-w-xl text-center mb-8">
        A Multi-Agent System powered by local models running natively on an M4 architecture. Request a project below.
      </p>

      <div className="w-full max-w-2xl bg-[#161B22] p-6 rounded-xl border border-[#30363d] shadow-[0_0_40px_rgba(0,229,255,0.05)]">
        <textarea
          autoFocus
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. Build a calculator web app with add, subtract, multiply, divide..."
          className="w-full h-32 p-4 bg-[#0D1117] text-gray-200 border border-[#30363d] rounded-lg focus:outline-none focus:border-primary resize-none placeholder-gray-600 mb-6"
        />
        <div className="flex justify-end">
          <button
            disabled={loading || !prompt.trim()}
            onClick={handleGenerate}
            className={`px-6 py-2 rounded-lg font-bold bg-[#00E5FF] text-[#0D1117] hover:bg-[#00B8CC] transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50 disabled:shadow-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Initializing Agents...' : 'Generate Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
