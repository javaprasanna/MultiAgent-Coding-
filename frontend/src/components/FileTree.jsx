import React from 'react';
import { Folder, File } from 'lucide-react';

export default function FileTree({ tree, files, onSelectFile, selectedFile, readonly = false }) {
  const renderTree = (node, path = "") => {
    if (!node) return null;
    return Object.entries(node).map(([name, children]) => {
      const fullPath = path ? `${path}/${name}` : name;
      const isFile = Object.keys(children || {}).length === 0 || typeof children === 'string';
      
      if (isFile) {
         const isSelected = selectedFile === fullPath;
         return (
           <div 
             key={fullPath} 
             onClick={() => !readonly && onSelectFile && onSelectFile(fullPath)}
             className={`flex items-center gap-3 py-1.5 px-2 text-sm rounded ${readonly ? 'cursor-default text-teal-600 font-mono' : 'cursor-pointer hover:bg-gray-100'} ${isSelected && !readonly ? 'bg-blue-50 text-blue-600' : (!readonly ? 'text-gray-600' : '')}`}
           >
             {!readonly && <File className="w-4 h-4" />}
             {readonly && <span className="text-[#00E5FF]/30 select-none font-bold">├─</span>}
             <span className="truncate">{name}</span>
           </div>
         );
      }

      return (
        <div key={fullPath} className={`pl-4 ${readonly ? 'border-l border-[#2D313E] ml-[7px]' : ''}`}>
           <div className={`flex flex-row items-center gap-2 py-1.5 px-2 text-sm ${readonly ? 'text-teal-400 font-mono' : 'text-gray-300'}`}>
            {!readonly && <Folder className="w-4 h-4 text-blue-400" />}
            {readonly && <span className="text-teal-700/50 select-none font-bold">├─</span>}
            <span>{name}</span>
          </div>
          {renderTree(children, fullPath)}
        </div>
      );
    });
  };

  return (
    <div className={`w-full h-full ${readonly ? '' : 'bg-white border-r border-gray-200 overflow-y-auto'}`}>
      {!readonly && <div className="p-4 uppercase text-xs font-bold text-gray-500 tracking-wider">Explorer</div>}
      <div className={`${readonly ? '' : 'px-2 pb-4'}`}>
        <div className={readonly ? 'text-teal-400 font-mono text-sm pl-0 py-1 font-bold' : ''}>{readonly ? 'project' : ''}</div>
        {renderTree(tree)}
      </div>
    </div>
  );
}
