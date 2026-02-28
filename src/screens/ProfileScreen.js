import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getUserProfile, upsertUserProfile } from '../data/store';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';

export default function ProfileScreen() {
  const { user, resetUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [roles, setRoles] = useState('');
  const [achievements, setAchievements] = useState('');

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((profile) => {
      if (!profile) return;
      setDisplayName(profile.displayName || '');
      setRoles((profile.roles || []).join(', '));
      setAchievements((profile.achievements || []).join(', '));
    });
  }, [user]);

  const onSave = async () => {
    if (!user) return;
    await upsertUserProfile(user.uid, {
      displayName: displayName || user.displayName || 'Unknown Creator',
      roles: roles
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      achievements: achievements
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    });
    Alert.alert('保存完了', 'プロフィールを更新しました。');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>プロフィール</Text>
        <Text style={styles.text}>UID: {user?.uid}</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="表示名"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={roles}
          onChangeText={setRoles}
          placeholder="役職(例: Vocal, Mix, Design)"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={achievements}
          onChangeText={setAchievements}
          placeholder="実績(カンマ区切り)"
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity style={styles.button} onPress={onSave}>
          <Text style={styles.buttonText}>保存</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={resetUser}>
          <Text style={[styles.buttonText, { color: '#f1f5f9' }]}>ユーザー再生成</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
