import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { applyToProject } from '../firebase/firestore';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';

export default function ProjectDetailScreen({ route, navigation }) {
  const { project } = route.params;
  const { user } = useAuth();
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');

  const onApply = async () => {
    await applyToProject(project.id, user.uid, role || 'general', message || '参加希望です。');
    Alert.alert('申請完了', 'オーナーの承認待ちです。');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.text}>{project.summary}</Text>
        <Text style={styles.muted}>status: {project.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.text, { marginBottom: 8, fontWeight: '700' }]}>参加申請</Text>
        <TextInput
          style={styles.input}
          value={role}
          onChangeText={setRole}
          placeholder="希望ロール"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="自己PR"
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity style={styles.button} onPress={onApply}>
          <Text style={styles.buttonText}>申請する</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('Workspace', { projectId: project.id })}
        >
          <Text style={[styles.buttonText, { color: '#f1f5f9' }]}>チャンネルを開く</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
