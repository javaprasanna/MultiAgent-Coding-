import React from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, filename }) {
  const ext = filename?.split('.').pop();
  let language = 'javascript';
  if (ext === 'py') language = 'python';
  if (ext === 'css') language = 'css';
  if (ext === 'html') language = 'html';
  if (ext === 'json') language = 'json';
  if (ext === 'md') language = 'markdown';
  if (['js', 'jsx'].includes(ext)) language = 'javascript';
  if (['ts', 'tsx'].includes(ext)) language = 'typescript';

  return (
    <div className="w-full h-full flex flex-col bg-transparent relative z-0">
      <div className="px-6 py-4 border-b border-gray-200 text-sm text-gray-600 font-mono flex items-center bg-gray-50 shadow-sm">
        // {filename || 'Select a file'}
      </div>
      <div className="flex-1 min-h-0 pt-4">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code || '// No file selected'}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 24,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            wordWrap: "on",
            scrollBeyondLastLine: false,
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
}
