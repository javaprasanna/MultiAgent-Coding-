import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, Loader2, Circle } from 'lucide-react';

const AGENTS = [
  { id: 'planner', name: 'Planning', model: 'deepseek-r1:14b' },
  { id: 'architect', name: 'Architecting', model: 'deepseek-coder-v2:16b' },
  { id: 'coder', name: 'Coding', model: 'qwen2.5-coder:14b' },
  { id: 'reviewer', name: 'Reviewing', model: 'qwen2.5-coder:14b' },
];

export default function AgentPipeline({ state, events }) {
  const getStatus = (agentId) => {
    const revEvents = [...events].reverse();
    const latestEvent = revEvents.find(e => e.stage === agentId);
    if (latestEvent) {
      return latestEvent.status; 
    }
    if (state?.status === `${agentId}_done` || state?.status === 'completed') return 'done';
    return 'pending';
  };

  const getSubtext = (agentId) => {
    if (agentId === 'coder') {
       const revEvents = [...events].reverse();
       const codingEvent = revEvents.find(e => e.stage === 'coder' && e.status === 'progress');
       if (codingEvent && codingEvent.data?.file) {
          const files = state?.architect_output?.files || [];
          const idx = files.findIndex(f => f.path === codingEvent.data.file) + 1;
          const total = files.length || 1;
          return `File ${idx}/${total}:\n${codingEvent.data.file}`;
       }
    }
    return '';
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex-1">
      <h2 className="font-bold text-gray-900 text-md mb-4">Pipeline Progress</h2>
      <div className="space-y-3 relative">
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-200 -z-10"></div>
        {AGENTS.map((agent) => {
          const status = getStatus(agent.id);
          const isActive = status === 'started' || status === 'progress';
          const subtext = getSubtext(agent.id);
          
          let Icon = Circle;
          let color = "text-gray-600";
          if (status === 'done') { Icon = CheckCircle2; color = "text-[#00E5FF]"; }
          if (status === 'error') { Icon = CircleDashed; color = "text-red-500"; }
          if (isActive) { Icon = Loader2; color = "text-blue-500 animate-spin"; }

          return (
            <motion.div 
              key={agent.id}
              className={`flex items-start gap-4 p-3 rounded-xl border transition-colors ${isActive ? 'bg-blue-50 border-blue-200' : status === 'done' ? 'bg-gray-50 border-gray-200' : 'bg-white border-transparent'}`}
            >
              <div className={`mt-0.5 bg-white rounded-full`}>
                 <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${status === 'done' ? 'text-gray-700' : isActive ? 'text-blue-600' : 'text-gray-500'}`}>{agent.name}</h3>
                </div>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">Model: {agent.model}</p>
                {subtext && isActive && (
                  <p className="text-[11px] text-blue-600 mt-2 font-mono whitespace-pre-wrap leading-tight">{subtext}</p>
                )}
                {status === 'error' && (
                  <div className="text-xs text-red-500 font-bold mt-2 truncate">
                    Failed: {events.slice().reverse().find(e => e.stage === agent.id && e.status === 'error')?.message || ''}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
