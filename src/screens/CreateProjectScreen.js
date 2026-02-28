import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createProject } from '../firebase/firestore';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';

export default function CreateProjectScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [requiredRoles, setRequiredRoles] = useState('');

  const onCreate = async () => {
    if (!title.trim()) {
      Alert.alert('入力不足', 'タイトルは必須です。');
      return;
    }
    const projectId = await createProject(user.uid, {
      title,
      summary,
      requiredRoles: requiredRoles
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    });
    setTitle('');
    setSummary('');
    setRequiredRoles('');
    Alert.alert('作成完了', `プロジェクトを作成しました: ${projectId}`);
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
        <TextInput
          style={styles.input}
          value={requiredRoles}
          onChangeText={setRequiredRoles}
          placeholder="募集ロール (カンマ区切り)"
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity style={styles.button} onPress={onCreate}>
          <Text style={styles.buttonText}>作成</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
