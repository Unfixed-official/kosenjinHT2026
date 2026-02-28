import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { acceptApplication, listMyApplications, listOwnedPendingApplications } from '../data/store';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';

export default function ApplicationsScreen() {
  const { user } = useAuth();
  const [myApps, setMyApps] = useState([]);
  const [ownerPending, setOwnerPending] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    const [a, b] = await Promise.all([listMyApplications(user.uid), listOwnedPendingApplications(user.uid)]);
    setMyApps(a);
    setOwnerPending(b);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const onAccept = async (item) => {
    await acceptApplication(item.projectId, item.applicantId, user.uid, item.applyRole || 'member');
    Alert.alert('承認完了', `${item.applicantId} を仮メンバーに追加しました。`);
    load();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>自分の申請状況</Text>
        {myApps.length === 0 ? <Text style={styles.muted}>申請はありません。</Text> : null}
        {myApps.map((item) => (
          <View key={item.projectId} style={{ marginBottom: 10 }}>
            <Text style={styles.text}>{item.title}</Text>
            <Text style={styles.muted}>{item.status}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>オーナー承認待ち</Text>
        {ownerPending.length === 0 ? <Text style={styles.muted}>承認待ちはありません。</Text> : null}
        {ownerPending.map((item) => (
          <View key={`${item.projectId}-${item.applicantId}`} style={{ marginBottom: 12 }}>
            <Text style={styles.text}>{item.projectTitle}</Text>
            <Text style={styles.muted}>
              {item.applicantId} / {item.applyRole}
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => onAccept(item)}>
              <Text style={styles.buttonText}>承認（仮メンバー化）</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
