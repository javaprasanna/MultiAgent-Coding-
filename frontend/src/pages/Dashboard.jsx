import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import AgentPipeline from '../components/AgentPipeline';
import ProjectPlan from '../components/ProjectPlan';
import SystemArchitecture from '../components/SystemArchitecture';
import CodeGeneration from '../components/CodeGeneration';
import ReviewReport from '../components/ReviewReport';
import { executeProject } from '../lib/api';
import { Rocket, Loader2, Settings, Download, Play, Share } from 'lucide-react';

export default function Dashboard() {
  const { sessionId } = useParams();
  const { state, events } = useSession(sessionId);
  const [executing, setExecuting] = useState(false);
  const [dockerLogs, setDockerLogs] = useState([]);
  
  const handleExecute = async () => {
    setExecuting(true);
    setDockerLogs(["Initializing Docker sandbox..."]);
    try {
      const res = await executeProject(sessionId);
      if (res.success) {
        setDockerLogs(prev => [...prev, `Container ${res.container_id} started. Application running successfully!`]);
      } else {
        setDockerLogs(prev => [...prev, ...(res.logs || [])]);
      }
    } catch (e) {
      setDockerLogs(prev => [...prev, e.message]);
    } finally {
        setExecuting(false);
    }
  };

  const handleDownload = () => {
    window.open(`http://localhost:8000/api/download/${sessionId}`, '_blank');
  };

  const isDone = state?.status?.includes('done') || state?.status === 'completed';

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded text-white font-bold w-8 h-8 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)]">D</div>
        <h1 className="text-xl font-bold text-gray-900 tracking-wide">DevForge</h1>
        <span className="text-xs ml-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">Multi-Agent System</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[380px] flex flex-col p-6 gap-6 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
            <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600"></div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="text-blue-400 w-5 h-5" />
                <h2 className="font-bold text-gray-900 text-md">DevForge Orchestrator</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 font-mono mb-4 border border-gray-200 leading-relaxed break-words whitespace-pre-wrap">
                {state?.prompt || "Awaiting prompt..."}
              </div>
              <div className="text-gray-500 text-xs flex items-center gap-1 mb-4 cursor-pointer hover:text-gray-700">
                 <Settings className="w-3 h-3"/> Advanced Settings
              </div>
              <button disabled className="mt-auto w-full py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-bold flex justify-center items-center gap-2 border border-gray-200 transition-all">
                {!isDone ? <Loader2 className="w-4 h-4 animate-spin text-blue-400"/> : null} 
                {!isDone ? "Processing..." : "Complete"}
              </button>
            </div>
          </div>

          <AgentPipeline state={state} events={events} />
          
          <div className="flex flex-col gap-2 mt-auto">
             <button onClick={handleDownload} disabled={!isDone} className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 rounded-lg text-sm font-bold border border-gray-200 shadow-sm transition-colors">
               <Download className="w-4 h-4"/> Download ZIP
             </button>
             <button onClick={handleExecute} disabled={executing || !isDone} className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors">
               {executing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4"/>} 
               {executing ? "Running..." : "Run in Docker"}
             </button>
             {dockerLogs.length > 0 && <div className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">{dockerLogs[dockerLogs.length-1]}</div>}
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50">
          <ProjectPlan state={state} />
          <SystemArchitecture state={state} />
          <CodeGeneration state={state} />
          {state?.review_report && <ReviewReport report={state.review_report} />}
        </main>
      </div>
    </div>
  );
}
