import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

export default function Terminal({ logs }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;
    
    const xterm = new XTerm({
      theme: { background: '#0D1117' },
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 13,
      convertEol: true
    });
    
    xterm.open(terminalRef.current);
    xtermRef.current = xterm;

    return () => {
      xterm.dispose();
    };
  }, []);

  useEffect(() => {
    if (xtermRef.current && logs) {
      xtermRef.current.clear();
      logs.forEach(log => xtermRef.current.writeln(log));
    }
  }, [logs]);

  return <div ref={terminalRef} className="w-full h-full p-2 bg-[#0D1117] overflow-hidden" />;
}
