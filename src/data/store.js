import { collection, doc, getDoc, getDocs, setDoc, updateDoc, onSnapshot, query, where, orderBy, arrayUnion, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { KOSEN_MAP } from './kosenLocations';
import { generateAIResponse } from './ai';

export async function upsertUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: Date.now()
  }, { merge: true });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function createProject(ownerId, payload) {
  const projectRef = doc(collection(db, 'projects'));
  const kosen = payload.kosenId ? KOSEN_MAP[payload.kosenId] : null;

  const projectInfo = {
    id: projectRef.id,
    ownerId,
    title: payload.title,
    summary: payload.summary,
    requiredRoles: payload.requiredRoles || [],
    kosenId: payload.kosenId || null,
    kosenName: kosen?.name || null,
    location: kosen ? { x: kosen.x, y: kosen.y } : payload.location || null,
    status: 'recruiting',
    createdAt: Date.now(),
    memberIds: [ownerId]
  };

  await setDoc(projectRef, projectInfo);

  // 初期のチャンネル(general)を作成
  const channelRef = doc(collection(db, 'projects', projectRef.id, 'channels'));
  await setDoc(channelRef, {
    id: channelRef.id,
    name: 'general',
    type: 'text',
    isPrivate: false,
    position: 1
  });

  // AI PMの初期メッセージ
  const msgRef = doc(collection(db, 'projects', projectRef.id, 'channels', channelRef.id, 'messages'));
  await setDoc(msgRef, {
    id: msgRef.id,
    senderId: 'AI_PM',
    text: 'プロジェクトが作成されました！本プロジェクトの進行は、私「AIプロジェクトマネージャー」がサポートします。\nメンバーが揃うまで、もう少しお待ち下さい。',
    createdAt: Date.now()
  });

  return projectRef.id;
}

export async function updateProject(projectId, updates) {
  await updateDoc(doc(db, 'projects', projectId), updates);
}

export async function deleteProject(projectId) {
  await deleteDoc(doc(db, 'projects', projectId));
}

export async function listProjects(keyword = '') {
  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const all = snap.docs.map(d => d.data());

  if (!keyword.trim()) return all;
  const lower = keyword.toLowerCase();
  return all.filter((p) => p.title?.toLowerCase().includes(lower) || p.summary?.toLowerCase().includes(lower));
}

export async function applyToProject(projectId, uid, role, message) {
  const pSnap = await getDoc(doc(db, 'projects', projectId));
  if (!pSnap.exists()) return;
  const project = pSnap.data();

  const appRef = doc(collection(db, 'applications'));
  await setDoc(appRef, {
    id: appRef.id,
    projectId,
    projectTitle: project.title,
    ownerId: project.ownerId,
    applicantId: uid,
    applyRole: role,
    message,
    status: 'accepted',
    createdAt: Date.now()
  });

  // 即時メンバー登録
  await updateDoc(doc(db, 'projects', projectId), {
    memberIds: arrayUnion(uid)
  });

  // AIメッセージ
  const chQ = query(collection(db, 'projects', projectId, 'channels'), where('name', '==', 'general'));
  const chSnap = await getDocs(chQ);
  if (!chSnap.empty) {
    const channelId = chSnap.docs[0].id;
    const msgRef = doc(collection(db, 'projects', projectId, 'channels', channelId, 'messages'));
    await setDoc(msgRef, {
      id: msgRef.id,
      senderId: 'AI_PM',
      text: `新しいメンバーがマッチングしました！🎉\n私「AIプロジェクトマネージャー」が進行を担当します。\nまずは皆さん、お互いに自己紹介と、得意なスキル・担当したいタスクについて話し合いましょう！`,
      createdAt: Date.now()
    });
  }
}

export async function acceptApplication(projectId, applicantId, reviewerId, role) {
  const q = query(
    collection(db, 'applications'),
    where('projectId', '==', projectId),
    where('applicantId', '==', applicantId),
    where('status', '==', 'pending')
  );
  const snap = await getDocs(q);
  if (snap.empty) return;

  const appDoc = snap.docs[0];
  await updateDoc(appDoc.ref, {
    status: 'accepted',
    reviewedBy: reviewerId,
    reviewedAt: Date.now()
  });

  // プロジェクトのメンバーとして追加
  await updateDoc(doc(db, 'projects', projectId), {
    memberIds: arrayUnion(applicantId)
  });

  // #general チャンネルにAIのお祝いメッセージを投稿
  const chQ = query(collection(db, 'projects', projectId, 'channels'), where('name', '==', 'general'));
  const chSnap = await getDocs(chQ);
  if (!chSnap.empty) {
    const channelId = chSnap.docs[0].id;
    const msgRef = doc(collection(db, 'projects', projectId, 'channels', channelId, 'messages'));
    await setDoc(msgRef, {
      id: msgRef.id,
      senderId: 'AI_PM',
      text: `新しいメンバーがマッチングしました！🎉\n私「AIプロジェクトマネージャー」が進行を担当します。\nまずは皆さん、お互いに自己紹介と、得意なスキル・担当したいタスクについて話し合いましょう！`,
      createdAt: Date.now()
    });
  }
}

export function subscribeChannels(projectId, callback) {
  const q = query(collection(db, 'projects', projectId, 'channels'));
  return onSnapshot(q, (snap) => {
    const channels = snap.docs.map(d => d.data()).sort((a, b) => a.position - b.position);
    callback(channels);
  });
}

export function subscribeMessages(projectId, channelId, callback) {
  const q = query(collection(db, 'projects', projectId, 'channels', channelId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(d => d.data());
    callback(messages);
  });
}

export async function sendMessage(projectId, channelId, uid, text) {
  if (!text.trim()) return;

  const msgRef = doc(collection(db, 'projects', projectId, 'channels', channelId, 'messages'));
  await setDoc(msgRef, {
    id: msgRef.id,
    senderId: uid,
    text: text.trim(),
    createdAt: Date.now()
  });

  if (uid !== 'AI_PM') {
    (async () => {
      try {
        const historyQ = query(collection(db, 'projects', projectId, 'channels', channelId, 'messages'), orderBy('createdAt', 'desc'), limit(10));
        const historySnap = await getDocs(historyQ);
        const history = historySnap.docs.map(d => d.data()).reverse();

        const pSnap = await getDoc(doc(db, 'projects', projectId));
        if (!pSnap.exists()) return;
        const project = pSnap.data();

        const aiResponseText = await generateAIResponse(project.ownerId, history);

        if (aiResponseText) {
          const aiMsgRef = doc(collection(db, 'projects', projectId, 'channels', channelId, 'messages'));
          await setDoc(aiMsgRef, {
            id: aiMsgRef.id,
            senderId: 'AI_PM',
            text: aiResponseText,
            createdAt: Date.now()
          });
        }
      } catch (err) {
        console.error('AI Integration Error:', err);
      }
    })();
  }
}

export async function listMyApplications(uid) {
  const q = query(collection(db, 'applications'), where('applicantId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function listOwnedPendingApplications(ownerId) {
  const q = query(collection(db, 'applications'), where('ownerId', '==', ownerId), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function listMyProjects(uid) {
  const q = query(collection(db, 'projects'), where('memberIds', 'array-contains', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}
