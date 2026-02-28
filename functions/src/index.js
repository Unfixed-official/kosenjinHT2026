const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const now = admin.firestore.FieldValue.serverTimestamp();

exports.requestMemberRemoval = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Login required');

  const { projectId, targetUid, reason } = request.data || {};
  if (!projectId || !targetUid) throw new HttpsError('invalid-argument', 'projectId and targetUid required');

  const projectRef = db.collection('projects').doc(projectId);
  const projectSnap = await projectRef.get();
  if (!projectSnap.exists) throw new HttpsError('not-found', 'project not found');

  const memberRef = projectRef.collection('members').doc(uid);
  const memberSnap = await memberRef.get();
  if (!memberSnap.exists) throw new HttpsError('permission-denied', 'member only');

  const reqRef = projectRef.collection('governance').doc('removalRequests').collection('items').doc();
  await reqRef.set({
    targetUid,
    requestedBy: uid,
    reason: reason || '',
    votes: { [uid]: 'approve' },
    minApprovals: 3,
    cooldownUntil: admin.firestore.Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24),
    status: 'open',
    createdAt: now,
    updatedAt: now
  });

  return { ok: true, requestId: reqRef.id };
});

exports.voteMemberRemoval = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Login required');

  const { projectId, requestId, vote } = request.data || {};
  if (!projectId || !requestId || !['approve', 'reject'].includes(vote)) {
    throw new HttpsError('invalid-argument', 'projectId/requestId/vote required');
  }

  const reqRef = db
    .collection('projects')
    .doc(projectId)
    .collection('governance')
    .doc('removalRequests')
    .collection('items')
    .doc(requestId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(reqRef);
    if (!snap.exists) throw new HttpsError('not-found', 'request not found');

    const data = snap.data();
    if (data.status !== 'open') throw new HttpsError('failed-precondition', 'request closed');
    const votes = { ...(data.votes || {}), [uid]: vote };
    const approvals = Object.values(votes).filter((v) => v === 'approve').length;

    const patch = { votes, updatedAt: now };
    if (approvals >= (data.minApprovals || 3)) {
      patch.status = 'approved';
    }
    tx.update(reqRef, patch);
  });

  return { ok: true };
});

exports.finalizeMemberRemoval = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Login required');

  const { projectId, requestId } = request.data || {};
  if (!projectId || !requestId) throw new HttpsError('invalid-argument', 'projectId and requestId required');

  const reqRef = db
    .collection('projects')
    .doc(projectId)
    .collection('governance')
    .doc('removalRequests')
    .collection('items')
    .doc(requestId);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) throw new HttpsError('not-found', 'request not found');

  const reqData = reqSnap.data();
  if (reqData.status !== 'approved') throw new HttpsError('failed-precondition', 'not approved');
  if (reqData.cooldownUntil?.toMillis() > Date.now()) {
    throw new HttpsError('failed-precondition', 'cooldown active');
  }

  const memberRef = db.collection('projects').doc(projectId).collection('members').doc(reqData.targetUid);
  await memberRef.update({ memberStatus: 'removed', removedAt: now });
  await reqRef.update({ status: 'executed', executedAt: now });

  return { ok: true };
});

exports.previewDistribution = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Login required');

  const { projectId, grossAmount } = request.data || {};
  if (!projectId || typeof grossAmount !== 'number') {
    throw new HttpsError('invalid-argument', 'projectId and grossAmount required');
  }

  const membersSnap = await db.collection('projects').doc(projectId).collection('members').get();
  const members = membersSnap.docs.map((d) => d.data()).filter((m) => m.memberStatus !== 'removed');

  const totalBps = members.reduce((sum, m) => sum + (m.shareBps || 0), 0) || 1;
  const results = members.map((m) => ({
    uid: m.uid,
    role: m.role,
    amount: Math.floor((grossAmount * (m.shareBps || 0)) / totalBps)
  }));

  const runRef = await db.collection('projects').doc(projectId).collection('distributionRuns').add({
    grossAmount,
    totalBps,
    results,
    createdBy: uid,
    createdAt: now,
    status: 'preview'
  });

  return { ok: true, runId: runRef.id, results };
});
