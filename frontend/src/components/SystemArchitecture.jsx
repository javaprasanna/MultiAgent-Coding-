import React from 'react';
import { Network, FileCode } from 'lucide-react';
import FileTree from './FileTree';

export default function SystemArchitecture({ state }) {
  if (!state?.architect_output) {
     return (
        <div className="bg-white rounded-xl p-10 border border-gray-200 border-dashed shadow-sm flex flex-col items-center justify-center text-gray-500 min-h-[300px]">
          <Network className="w-10 h-10 mb-4 text-gray-300" />
          <p className="text-sm font-bold tracking-widest uppercase text-gray-500">Awaiting System Architecture</p>
          <p className="text-xs mt-2 text-gray-600">The Architect agent will populate the directory tree and file manifests.</p>
        </div>
     );
  }
  const { files, directory_tree } = state.architect_output;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-teal-500/10 p-2 rounded-full border border-teal-500/20">
          <Network className="w-5 h-5 text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-wide">System Architecture</h2>
      </div>

      <div className="flex gap-8">
        <div className="w-80">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Directory Structure</h3>
           <div className="bg-gray-50 p-4 pt-2 rounded-lg border border-gray-200 min-h-[300px] max-h-[500px] overflow-y-auto">
             <FileTree tree={directory_tree} readonly={true} />
           </div>
        </div>

        <div className="flex-1">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Files to Generate</h3>
           <div className="space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto pr-2">
             {files.map((file, i) => (
               <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 px-4 rounded-lg hover:border-gray-300 transition-colors cursor-default">
                 <div className="flex items-start gap-4">
                   <div className="bg-teal-500/10 p-1.5 rounded text-teal-400 mt-0.5">
                     <FileCode className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-gray-800 font-mono">{file.path}</p>
                     <p className="text-xs text-gray-500 truncate max-w-sm mt-1">{file.purpose || 'File component'}</p>
                   </div>
                 </div>
                 <span className="text-gray-600">&rsaquo;</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
