import React from 'react';
import { Target, TerminalSquare } from 'lucide-react';

export default function ProjectPlan({ state }) {
  if (!state?.planner_output) {
     return (
        <div className="bg-white rounded-xl p-10 border border-gray-200 border-dashed shadow-sm flex flex-col items-center justify-center text-gray-500 min-h-[300px]">
          <Target className="w-10 h-10 mb-4 text-gray-300" />
          <p className="text-sm font-bold tracking-widest uppercase">Awaiting Project Plan</p>
          <p className="text-xs mt-2 text-gray-600">The Planner agent will construct this section once it begins generating.</p>
        </div>
     );
  }

  const { project_name, description, tech_stack, features, architecture_notes } = state.planner_output;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500/10 p-2 rounded-full border border-blue-500/20">
          <Target className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-wide">Project Plan: <span className="text-gray-600 font-normal">{project_name}</span></h2>
      </div>

      <div className="border-l-2 border-indigo-500 pl-4 py-1 mb-8">
        <p className="text-gray-700 italic">"{description}"</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-6">
        <div>
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
             <Target className="w-3 h-3"/> Tech Stack
           </h3>
           <div className="space-y-3">
             {tech_stack.frontend && (
               <div className="flex items-center gap-4 bg-gray-50 p-2 px-4 rounded-full border border-gray-200 w-max">
                 <span className="text-xs text-gray-500 font-mono">frontend:</span>
                 <span className="text-sm text-blue-600">{tech_stack.frontend}</span>
               </div>
             )}
             <div className="flex gap-4 flex-wrap">
                 {tech_stack.backend && (
                   <div className="flex items-center gap-3 bg-gray-50 p-2 px-4 rounded-full border border-gray-200 w-max">
                     <span className="text-xs text-gray-500 font-mono">backend:</span>
                     <span className="text-sm text-gray-700">{tech_stack.backend}</span>
                   </div>
                 )}
                 {tech_stack.database && (
                   <div className="flex items-center gap-3 bg-gray-50 p-2 px-4 rounded-full border border-gray-200 w-max">
                     <span className="text-xs text-gray-500 font-mono">database:</span>
                     <span className="text-sm text-gray-700">{tech_stack.database}</span>
                   </div>
                 )}
             </div>
           </div>

           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-6 mb-3 flex items-center gap-2">
             <TerminalSquare className="w-3 h-3"/> Architecture & Entry
           </h3>
           <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                 <span className="text-xs text-gray-500 font-mono">Style:</span>
                 <span className="text-sm text-gray-700">{tech_stack.framework || 'standard'}</span>
              </div>
           </div>
        </div>

        <div>
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
             <Target className="w-3 h-3"/> Key Features
           </h3>
           <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 h-full">
             <ul className="space-y-3">
               {features.map((f, i) => (
                 <li key={i} className="text-sm text-gray-700 flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div> {f}
                 </li>
               ))}
             </ul>
           </div>
        </div>
      </div>

      {architecture_notes && (
         <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
            <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-widest mb-1">Architectural Notes</h4>
            <p className="text-sm text-yellow-700">{architecture_notes}</p>
         </div>
      )}
    </div>
  );
}
