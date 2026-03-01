import React, { useState } from 'react';
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createProject, getUserProfile } from '../data/store';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';
import { Feather } from '@expo/vector-icons';

export const ROLE_OPTIONS = [
  "フロントエンド開発（Web / モバイル）",
  "バックエンド開発（API / DB設計）",
  "インフラ・クラウド構築",
  "AI・機械学習",
  "ハードウェア・IoT開発",
  "UIデザイン",
  "UX設計",
  "3Dモデリング",
  "動画制作・モーショングラフィック"
];

export default function CreateProjectScreen({ onProjectCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

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

      const projectId = await createProject(user.uid, {
        title,
        summary,
        requiredRoles: selectedRoles,
        kosenId: profile.kosenId
      });

      setTitle('');
      setSummary('');
      setSelectedRoles([]);

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
          placeholder="プロジェクト名"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          value={summary}
          onChangeText={setSummary}
          placeholder="プロジェクトの概要"
          placeholderTextColor="#94a3b8"
          multiline
        />

        <Text style={[styles.text, { marginTop: 12, marginBottom: 8, fontWeight: '700' }]}>募集ロール（複数選択可）</Text>
        <View style={{ marginBottom: 16 }}>
          {ROLE_OPTIONS.map((role) => {
            const isSelected = selectedRoles.includes(role);
            return (
              <TouchableOpacity
                key={role}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                onPress={() => toggleRole(role)}
              >
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: isSelected ? '#4f46e5' : '#94a3b8',
                  backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  {isSelected && <Feather name="check" size={16} color="#fff" />}
                </View>
                <Text style={{ color: '#1f2a44', fontSize: 16, flexShrink: 1 }}>{role}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={onCreate}>
          <Text style={styles.buttonText}>作成</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
