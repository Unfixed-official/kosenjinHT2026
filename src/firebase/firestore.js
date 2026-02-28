import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './config';

export async function upsertUserProfile(uid, data) {
  const ref = doc(db, 'users', uid);
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getUserProfile(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function createProject(ownerId, payload) {
  const projectRef = await addDoc(collection(db, 'projects'), {
    ownerId,
    title: payload.title,
    summary: payload.summary,
    requiredRoles: payload.requiredRoles,
    status: 'recruiting',
    createdAt: serverTimestamp()
  });

  await setDoc(doc(db, 'projects', projectRef.id, 'members', ownerId), {
    uid: ownerId,
    role: 'owner',
    memberStatus: 'active',
    shareBps: 3000,
    joinedAt: serverTimestamp()
  });

  await addDoc(collection(db, 'projects', projectRef.id, 'channels'), {
    name: 'general',
    type: 'text',
    isPrivate: false,
    position: 1,
    createdAt: serverTimestamp()
  });

  return projectRef.id;
}

export async function listProjects(keyword = '') {
  const baseQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(50));
  const snap = await getDocs(baseQuery);
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (!keyword.trim()) return all;
  const lower = keyword.toLowerCase();
  return all.filter(
    (p) => p.title?.toLowerCase().includes(lower) || p.summary?.toLowerCase().includes(lower)
  );
}

export async function applyToProject(projectId, uid, role, message) {
  await setDoc(doc(db, 'projects', projectId, 'applications', uid), {
    applicantId: uid,
    applyRole: role,
    message,
    status: 'pending',
    createdAt: serverTimestamp()
  });
}

export async function acceptApplication(projectId, applicantId, reviewerId, role) {
  await updateDoc(doc(db, 'projects', projectId, 'applications', applicantId), {
    status: 'accepted',
    reviewedBy: reviewerId,
    reviewedAt: serverTimestamp()
  });

  await setDoc(doc(db, 'projects', projectId, 'members', applicantId), {
    uid: applicantId,
    role,
    memberStatus: 'provisional',
    shareBps: 1500,
    joinedAt: serverTimestamp()
  });
}

export function subscribeChannels(projectId, callback) {
  const q = query(collection(db, 'projects', projectId, 'channels'), orderBy('position', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeMessages(projectId, channelId, callback) {
  const q = query(
    collection(db, 'projects', projectId, 'channels', channelId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendMessage(projectId, channelId, uid, text) {
  if (!text.trim()) return;
  await addDoc(collection(db, 'projects', projectId, 'channels', channelId, 'messages'), {
    senderId: uid,
    text: text.trim(),
    createdAt: serverTimestamp()
  });
}

export async function listMyApplications(uid) {
  const projectsSnap = await getDocs(query(collection(db, 'projects'), limit(50)));
  const results = [];
  for (const project of projectsSnap.docs) {
    const appRef = doc(db, 'projects', project.id, 'applications', uid);
    const appSnap = await getDoc(appRef);
    if (appSnap.exists()) {
      results.push({
        projectId: project.id,
        title: project.data().title,
        ...appSnap.data()
      });
    }
  }
  return results;
}

export async function listOwnedPendingApplications(ownerId) {
  const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', ownerId), limit(20));
  const projectsSnap = await getDocs(projectsQuery);
  const pending = [];
  for (const projectDoc of projectsSnap.docs) {
    const appsSnap = await getDocs(
      query(
        collection(db, 'projects', projectDoc.id, 'applications'),
        where('status', '==', 'pending'),
        limit(50)
      )
    );
    appsSnap.forEach((appDoc) => {
      pending.push({
        projectId: projectDoc.id,
        projectTitle: projectDoc.data().title,
        applicantId: appDoc.id,
        ...appDoc.data()
      });
    });
  }
  return pending;
}
