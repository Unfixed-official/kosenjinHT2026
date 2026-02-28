import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getUserProfile, upsertUserProfile } from '../data/store';
import { KOSEN_LOCATIONS, getKosenById } from '../data/kosenLocations';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';

export default function ProfileScreen() {
  const { user, resetUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [roles, setRoles] = useState('');
  const [achievements, setAchievements] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [kosenId, setKosenId] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((profile) => {
      if (!profile) return;
      setDisplayName(profile.displayName || '');
      setRoles((profile.roles || []).join(', '));
      setAchievements((profile.achievements || []).join(', '));
      setGeminiKey(profile.geminiKey || '');
      setKosenId(profile.kosenId || null);
    });
  }, [user]);

  const onSave = async () => {
    if (!user) return;
    await upsertUserProfile(user.uid, {
      displayName: displayName || user.displayName || 'Unknown Creator',
      kosenId: kosenId,
      geminiKey: geminiKey.trim(),
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

        <Text style={[styles.text, { marginBottom: 4 }]}>所属高専</Text>
        <TouchableOpacity
          style={[styles.input, { justifyContent: 'center' }]}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={{ color: kosenId ? '#1f2a44' : '#94a3b8' }}>
            {kosenId ? getKosenById(kosenId)?.name : '高専を選択'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.text, { marginTop: 8, marginBottom: 4, fontWeight: '700' }]}>開発者設定（AI PM用）</Text>
        <TextInput
          style={styles.input}
          value={geminiKey}
          onChangeText={setGeminiKey}
          placeholder="Gemini API Key"
          placeholderTextColor="#94a3b8"
          secureTextEntry={true}
        />

        <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={onSave}>
          <Text style={styles.buttonText}>保存</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={resetUser}>
          <Text style={[styles.buttonText, { color: '#f1f5f9' }]}>ユーザー再生成</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={pickerVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, maxHeight: '80%', padding: 10 }}>
            <Text style={[styles.title, { padding: 10, marginBottom: 0 }]}>高専を選択</Text>
            <ScrollView style={{ padding: 10 }}>
              {KOSEN_LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
                  onPress={() => {
                    setKosenId(loc.id);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16, color: loc.id === kosenId ? '#4f46e5' : '#1f2a44', fontWeight: loc.id === kosenId ? '700' : '400' }}>
                    {loc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]} onPress={() => setPickerVisible(false)}>
              <Text style={[styles.buttonText, { color: '#f1f5f9' }]}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
