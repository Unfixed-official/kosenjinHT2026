import { KOSEN_MAP } from './kosenLocations';
import { generateAIResponse } from './ai';

const state = {
  users: {},
  projects: [],
  applications: {},
  members: {},
  channels: {},
  messages: {}
};

const channelListeners = {};
const messageListeners = {};

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function ensureProjectBuckets(projectId) {
  if (!state.applications[projectId]) state.applications[projectId] = {};
  if (!state.members[projectId]) state.members[projectId] = {};
  if (!state.channels[projectId]) state.channels[projectId] = [];
  if (!state.messages[projectId]) state.messages[projectId] = {};
}

function emitChannels(projectId) {
  const key = projectId;
  const listeners = channelListeners[key] || [];
  const channels = [...(state.channels[projectId] || [])].sort((a, b) => a.position - b.position);
  listeners.forEach((callback) => callback(channels));
}

function emitMessages(projectId, channelId) {
  const key = `${projectId}:${channelId}`;
  const listeners = messageListeners[key] || [];
  const messages = [...(state.messages[projectId]?.[channelId] || [])];
  listeners.forEach((callback) => callback(messages));
}

export async function upsertUserProfile(uid, data) {
  state.users[uid] = {
    ...(state.users[uid] || {}),
    ...data,
    updatedAt: new Date().toISOString()
  };
}

export async function getUserProfile(uid) {
  return state.users[uid] || null;
}

export async function createProject(ownerId, payload) {
  const projectId = makeId('project');
  const kosen = payload.kosenId ? KOSEN_MAP[payload.kosenId] : null;
  const project = {
    id: projectId,
    ownerId,
    title: payload.title,
    summary: payload.summary,
    requiredRoles: payload.requiredRoles || [],
    kosenId: payload.kosenId || null,
    kosenName: kosen?.name || null,
    location: kosen ? { x: kosen.x, y: kosen.y } : payload.location || null,
    status: 'recruiting',
    createdAt: Date.now()
  };

  state.projects.unshift(project);
  ensureProjectBuckets(projectId);

  state.members[projectId][ownerId] = {
    uid: ownerId,
    role: 'owner',
    memberStatus: 'active',
    shareBps: 3000,
    joinedAt: Date.now()
  };

  const generalId = makeId('channel');
  state.channels[projectId].push({
    id: generalId,
    name: 'general',
    type: 'text',
    isPrivate: false,
    position: 1
  });
  state.messages[projectId][generalId] = [
    {
      id: makeId('msg'),
      senderId: 'AI_PM',
      text: 'プロジェクトが作成されました！本プロジェクトの進行は、私「AIプロジェクトマネージャー」がサポートします。\nメンバーが揃うまで、もう少しお待ち下さい。',
      createdAt: Date.now()
    }
  ];
  emitChannels(projectId);

  return projectId;
}

export async function listProjects(keyword = '') {
  const all = [...state.projects].sort((a, b) => b.createdAt - a.createdAt);
  if (!keyword.trim()) return all;
  const lower = keyword.toLowerCase();
  return all.filter((p) => p.title?.toLowerCase().includes(lower) || p.summary?.toLowerCase().includes(lower));
}

export async function applyToProject(projectId, uid, role, message) {
  ensureProjectBuckets(projectId);
  state.applications[projectId][uid] = {
    applicantId: uid,
    applyRole: role,
    message,
    status: 'pending',
    createdAt: Date.now()
  };
}

export async function acceptApplication(projectId, applicantId, reviewerId, role) {
  ensureProjectBuckets(projectId);
  const app = state.applications[projectId][applicantId];
  if (!app) return;

  app.status = 'accepted';
  app.reviewedBy = reviewerId;
  app.reviewedAt = Date.now();

  state.members[projectId][applicantId] = {
    uid: applicantId,
    role,
    memberStatus: 'provisional',
    shareBps: 1500,
    joinedAt: Date.now()
  };

  const general = state.channels[projectId].find(c => c.name === 'general');
  if (general) {
    if (!state.messages[projectId][general.id]) state.messages[projectId][general.id] = [];
    state.messages[projectId][general.id].push({
      id: makeId('msg'),
      senderId: 'AI_PM',
      text: `新しいメンバーがマッチングしました！🎉\n私「AIプロジェクトマネージャー」が進行を担当します。\nまずは皆さん、お互いに自己紹介と、得意なスキル・担当したいタスクについて話し合いましょう！`,
      createdAt: Date.now()
    });
    emitMessages(projectId, general.id);
  }
}

export function subscribeChannels(projectId, callback) {
  ensureProjectBuckets(projectId);
  const key = projectId;
  if (!channelListeners[key]) channelListeners[key] = [];
  channelListeners[key].push(callback);
  emitChannels(projectId);

  return () => {
    channelListeners[key] = (channelListeners[key] || []).filter((cb) => cb !== callback);
  };
}

export function subscribeMessages(projectId, channelId, callback) {
  ensureProjectBuckets(projectId);
  if (!state.messages[projectId][channelId]) {
    state.messages[projectId][channelId] = [];
  }

  const key = `${projectId}:${channelId}`;
  if (!messageListeners[key]) messageListeners[key] = [];
  messageListeners[key].push(callback);
  emitMessages(projectId, channelId);

  return () => {
    messageListeners[key] = (messageListeners[key] || []).filter((cb) => cb !== callback);
  };
}

export async function sendMessage(projectId, channelId, uid, text) {
  if (!text.trim()) return;
  ensureProjectBuckets(projectId);
  if (!state.messages[projectId][channelId]) state.messages[projectId][channelId] = [];
  state.messages[projectId][channelId].push({
    id: makeId('msg'),
    senderId: uid,
    text: text.trim(),
    createdAt: Date.now()
  });
  emitMessages(projectId, channelId);

  // Invoke real AI PM if a user messages
  if (uid !== 'AI_PM') {
    // Generate async so we don't block the UI
    (async () => {
      try {
        const history = state.messages[projectId][channelId].slice(-10); // get last 10 messages for context
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return;

        // Pass the ownerId (who created the project and presumably set the API key) to get the AI response
        const aiResponseText = await generateAIResponse(project.ownerId, history);

        if (aiResponseText) {
          state.messages[projectId][channelId].push({
            id: makeId('msg'),
            senderId: 'AI_PM',
            text: aiResponseText,
            createdAt: Date.now()
          });
          emitMessages(projectId, channelId);
        }
      } catch (err) {
        console.error('AI Integration Error:', err);
      }
    })();
  }
}

export async function listMyApplications(uid) {
  const results = [];
  for (const project of state.projects) {
    const app = state.applications[project.id]?.[uid];
    if (app) {
      results.push({
        projectId: project.id,
        title: project.title,
        ...app
      });
    }
  }
  return results;
}

export async function listOwnedPendingApplications(ownerId) {
  const pending = [];
  for (const project of state.projects.filter((p) => p.ownerId === ownerId)) {
    const apps = Object.entries(state.applications[project.id] || {});
    for (const [applicantId, app] of apps) {
      if (app.status === 'pending') {
        pending.push({
          projectId: project.id,
          projectTitle: project.title,
          applicantId,
          ...app
        });
      }
    }
  }
  return pending;
}
