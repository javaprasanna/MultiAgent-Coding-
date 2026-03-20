import React, { useState } from 'react';
import { Code2 } from 'lucide-react';
import CodeEditor from './CodeEditor';

export default function CodeGeneration({ state }) {
  const generatedFiles = state?.generated_files || {};
  const fileKeys = Object.keys(generatedFiles);
  const [selectedFile, setSelectedFile] = useState(fileKeys[0] || null);

  if (fileKeys.length === 0) {
      return (
        <div className="bg-white rounded-xl p-10 border border-gray-200 border-dashed shadow-sm flex flex-col items-center justify-center text-gray-500 min-h-[400px]">
          <Code2 className="w-10 h-10 mb-4 text-gray-300" />
          <p className="text-sm font-bold tracking-widest uppercase text-gray-500">Awaiting Code Generation</p>
          <p className="text-xs mt-2 text-gray-600">The Coder agent will write the core files here.</p>
        </div>
     );
  }
  if (!selectedFile && fileKeys.length > 0) setSelectedFile(fileKeys[0]);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-cyan-500/10 p-2 rounded-full border border-cyan-500/20">
          <Code2 className="w-5 h-5 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-wide">
          Code Generation 
          <span className="text-xs font-bold text-cyan-400 ml-3 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            {fileKeys.length} files generated
          </span>
        </h2>
      </div>

      <div className="flex h-[600px] border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="w-72 max-h-full overflow-y-auto border-r border-gray-200 py-4 bg-gray-50">
           {fileKeys.map(file => (
             <div 
               key={file}
               onClick={() => setSelectedFile(file)}
               className={`px-4 py-2.5 my-1 mx-3 rounded-lg text-xs font-mono cursor-pointer truncate transition-colors ${selectedFile === file ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold' : 'text-gray-600 hover:text-gray-900 hover:bg-white border border-transparent'}`}
             >
               {file}
             </div>
           ))}
        </div>
        
        <div className="flex-1 bg-white flex flex-col relative w-full h-full min-w-0">
           {selectedFile && (
             <CodeEditor filename={selectedFile} code={generatedFiles[selectedFile]?.trim()} />
           )}
        </div>
      </div>
    </div>
  );
}
