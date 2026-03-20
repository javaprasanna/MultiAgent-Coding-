const API_BASE_URL = 'http://localhost:8000/api';

export async function generateProject(prompt) {
  const res = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error("Failed to generate project");
  return res.json();
}

export async function getSession(sessionId) {
  const res = await fetch(`${API_BASE_URL}/session/${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch session");
  return res.json();
}

export async function executeProject(sessionId) {
  const res = await fetch(`${API_BASE_URL}/execute/${sessionId}`, {
    method: 'POST'
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to execute project");
  }
  return res.json();
}

export const WS_BASE_URL = 'ws://localhost:8000/ws';
