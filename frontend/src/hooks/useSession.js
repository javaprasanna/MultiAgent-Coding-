import { useState, useEffect, useRef } from 'react';
import { getSession, WS_BASE_URL } from '../lib/api';

export function useSession(sessionId) {
  const [state, setState] = useState(null);
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    // Load initial state
    getSession(sessionId).then(data => setState(data)).catch(console.error);

    // Setup WS
    const ws = new WebSocket(`${WS_BASE_URL}/${sessionId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents(prev => [...prev, data]);
      
      // Update state organically if major step done
      if (data.status === 'done' || data.status === 'error') {
        getSession(sessionId).then(updated => setState(updated)).catch(console.error);
      }
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  return { state, events };
}
