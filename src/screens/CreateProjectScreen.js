import React, { useState } from 'react';
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createProject, getUserProfile } from '../data/store';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';

const ROLE_OPTIONS = ['フロントエンド', 'バックエンド', 'デザイナー', 'その他'];

export default function CreateProjectScreen({ onProjectCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [otherRoleText, setOtherRoleText] = useState('');

  const hasOther = selectedRoles.includes('その他');

  const toggleRole = (role) => {
    setSelectedRoles((current) => {
      if (current.includes(role)) {
        return current.filter((r) => r !== role);
      }
      return [...current, role];
    });
  };

  const validateBasic = () => {
    if (!title.trim()) {
      Alert.alert('入力不足', 'タイトルは必須です。');
      return false;
    }
    if (selectedRoles.length === 0) {
      Alert.alert('入力不足', '募集ロールを1つ以上選択してください。');
      return false;
    }

    if (hasOther && !otherRoleText.trim()) {
      Alert.alert('入力不足', '「その他」を選択した場合は内容を入力してください。');
      return false;
    }

    return true;
  };

  const onCreate = async () => {
    try {
      if (!validateBasic()) return;

      const profile = await getUserProfile(user.uid);
      if (!profile || !profile.kosenId) {
        if (Platform.OS === 'web') {
          window.alert('プロジェクトを作成するには、プロフィール画面で所属高専を設定してください。');
        } else {
          Alert.alert('プロフィールの設定が必要です', 'プロジェクトを作成するには、プロフィール画面で所属高専を設定してください。');
        }
        return;
      }

      const normalizedRoles = selectedRoles
        .filter((r) => r !== 'その他')
        .concat(hasOther ? [otherRoleText.trim()] : []);

      const projectId = await createProject(user.uid, {
        title,
        summary,
        requiredRoles: normalizedRoles,
        kosenId: profile.kosenId
      });

      setTitle('');
      setSummary('');
      setSelectedRoles([]);
      setOtherRoleText('');

      if (Platform.OS === 'web') {
        window.alert('プロジェクトを作成しました！');
        onProjectCreated?.();
      } else {
        Alert.alert('作成完了', 'プロジェクトを作成しました！', [
          { text: 'OK', onPress: () => onProjectCreated?.() }
        ]);
      }
    } catch (e) {
      console.error(e);
      if (Platform.OS === 'web') {
        window.alert('エラー: ' + e.message);
      } else {
        Alert.alert('エラー', e.message);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>プロジェクト作成</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="タイトル"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={summary}
          onChangeText={setSummary}
          placeholder="概要"
          placeholderTextColor="#94a3b8"
        />
        <Text style={[styles.text, { marginBottom: 8, fontWeight: '700' }]}>募集ロール（複数選択可）</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {ROLE_OPTIONS.map((role) => {
            const active = selectedRoles.includes(role);
            return (
              <TouchableOpacity
                key={role}
                onPress={() => toggleRole(role)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? '#6ea8fe' : '#232938',
                    marginRight: 8,
                    marginBottom: 8
                  }
                ]}
              >
                <Text style={{ color: active ? '#0f1115' : '#f1f5f9', fontWeight: active ? '700' : '500' }}>{role}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TextInput
          style={[styles.input, { opacity: hasOther ? 1 : 0.5 }]}
          value={otherRoleText}
          onChangeText={setOtherRoleText}
          editable={hasOther}
          placeholder="その他の募集ロールを入力"
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity style={styles.button} onPress={onCreate}>
          <Text style={styles.buttonText}>作成</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
