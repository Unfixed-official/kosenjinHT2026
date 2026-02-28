import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { listProjects } from '../firebase/firestore';
import { styles } from '../ui/styles';

export default function ProjectsScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listProjects(keyword));
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#fff" />}
    >
      <View style={styles.section}>
        <Text style={styles.title}>プロジェクト検索</Text>
        <TextInput
          style={styles.input}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="キーワード"
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity style={styles.button} onPress={load}>
          <Text style={styles.buttonText}>検索</Text>
        </TouchableOpacity>
      </View>

      {items.map((project) => (
        <TouchableOpacity
          key={project.id}
          style={styles.section}
          onPress={() => navigation.navigate('ProjectDetail', { project })}
        >
          <Text style={[styles.text, { fontWeight: '700', marginBottom: 4 }]}>{project.title}</Text>
          <Text style={styles.text}>{project.summary}</Text>
          <Text style={styles.muted}>status: {project.status}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
