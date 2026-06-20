// DRISHTI - Project + Chat History Service
// Claude जैसा - projects में conversations organize होंगी

const PROJECTS_KEY = 'drishti_projects';
const CURRENT_PROJECT = 'current_project_id';
const CURRENT_SESSION = 'current_session_id';

// ── Projects ──
export const getProjects = () => {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  } catch { return []; }
};

export const createProject = (name = 'New Project', description = '') => {
  const projects = getProjects();
  const project = {
    id: 'proj_' + Date.now(),
    name, description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  projects.unshift(project);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return project;
};

export const deleteProject = (projectId) => {
  // project की सारी chats delete करो
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith(`chat_${projectId}_`)) localStorage.removeItem(key);
  }
  const projects = getProjects().filter(p => p.id !== projectId);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

// ── Sessions (Chats within a project) ──
export const getCurrentProjectId = () =>
  localStorage.getItem(CURRENT_PROJECT) || 'default';

export const setCurrentProjectId = (id) =>
  localStorage.setItem(CURRENT_PROJECT, id);

export const getCurrentSessionId = () =>
  localStorage.getItem(CURRENT_SESSION) || createSession();

export const createSession = (projectId) => {
  const pid = projectId || getCurrentProjectId();
  const id = `${pid}_${Date.now()}`;
  localStorage.setItem(CURRENT_SESSION, id);
  return id;
};

// ── Messages ──
export const saveMessage = (role, content, sessionId) => {
  const sid = sessionId || getCurrentSessionId();
  const key = `chat_${sid}`;
  try {
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.push({ role, content, timestamp: Date.now() });
    if (history.length > 100) history.splice(0, history.length - 100);
    localStorage.setItem(key, JSON.stringify(history));
  } catch {}
};

export const getMessages = (sessionId) => {
  const sid = sessionId || getCurrentSessionId();
  try {
    return JSON.parse(localStorage.getItem(`chat_${sid}`) || '[]');
  } catch { return []; }
};

export const getContext = (sessionId, limit = 12) => {
  return getMessages(sessionId)
    .slice(-limit)
    .map(({ role, content }) => ({ role, content }));
};

// ── All Sessions list ──
export const getAllSessions = (projectId) => {
  const sessions = [];
  const prefix = projectId ? `chat_${projectId}_` : 'chat_';
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      try {
        const history = JSON.parse(localStorage.getItem(key) || '[]');
        if (history.length === 0) continue;
        const lastUser = [...history].reverse().find(m => m.role === 'user');
        sessions.push({
          id: key.replace('chat_', ''),
          key,
          title: lastUser?.content?.slice(0, 50) || 'Chat',
          preview: history[history.length - 1]?.content?.slice(0, 70) || '',
          timestamp: history[history.length - 1]?.timestamp || 0,
          count: history.length,
        });
      } catch {}
    }
  }
  return sessions.sort((a, b) => b.timestamp - a.timestamp);
};

export const deleteSession = (sessionKey) => {
  localStorage.removeItem(sessionKey);
};

export default {
  getProjects, createProject, deleteProject,
  getCurrentProjectId, setCurrentProjectId,
  getCurrentSessionId, createSession,
  saveMessage, getMessages, getContext,
  getAllSessions, deleteSession,
};
