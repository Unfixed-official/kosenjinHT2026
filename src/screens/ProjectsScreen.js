import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { listProjects } from '../data/store';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';

const ROLE_FILTER_OPTIONS = ['フロントエンド', 'バックエンド', 'デザイナー', 'その他'];
const BASE_ROLES = ['フロントエンド', 'バックエンド', 'デザイナー'];

export default function ProjectsScreen({ setActiveSection }) {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilters, setRoleFilters] = useState([]);

  const toggleRoleFilter = (role) => {
    setRoleFilters((current) => (current.includes(role) ? current.filter((r) => r !== role) : [...current, role]));
  };

  const matchesRoleFilter = (project) => {
    if (roleFilters.length === 0) return true;
    const roles = project.requiredRoles || [];
    return roleFilters.some((filter) => {
      if (filter === 'その他') {
        return roles.some((role) => !BASE_ROLES.includes(role));
      }
      return roles.includes(filter);
    });
  };

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

  const filteredItems = items.filter(matchesRoleFilter);

  return (
    <View style={[styles.container, { paddingBottom: 10 }]}>
      <View style={[styles.section, { marginBottom: 10 }]}>
        <Text style={[styles.text, { marginBottom: 8, fontWeight: '700' }]}>検索条件</Text>
        <TextInput
          style={styles.input}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="キーワード"
          placeholderTextColor="#94a3b8"
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {ROLE_FILTER_OPTIONS.map((role) => {
            const active = roleFilters.includes(role);
            return (
              <TouchableOpacity
                key={role}
                onPress={() => toggleRoleFilter(role)}
                style={[styles.chip, { backgroundColor: active ? '#c7d2fe' : '#eef2ff' }]}
              >
                <Text style={{ color: '#1f2a44', fontWeight: active ? '700' : '500' }}>{role}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.button} onPress={load}>
          <Text style={styles.buttonText}>{loading ? '検索中...' : '検索'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {filteredItems.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={styles.section}
            onPress={() => {
              if (project.memberIds && project.memberIds.includes(user?.uid)) {
                setActiveSection({ name: 'Workspace', params: { projectId: project.id } });
              } else {
                setActiveSection({ name: 'ProjectDetail', params: { project } });
              }
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.text, { fontWeight: '700', marginBottom: 4 }]}>{project.title}</Text>
                <Text style={styles.text}>{project.summary}</Text>
                <Text style={styles.muted}>kosen: {project.kosenName || '-'}</Text>
                <Text style={styles.muted}>roles: {(project.requiredRoles || []).join(', ') || '-'}</Text>
                <Text style={styles.muted}>status: {project.status}</Text>
              </View>
              {project.memberIds && project.memberIds.includes(user?.uid) && (
                <TouchableOpacity
                  style={{ padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    setActiveSection({ name: 'ProjectDetail', params: { project } });
                  }}
                >
                  <Text style={{ color: '#475569', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>詳細</Text>
                  <Feather name="info" size={20} color="#475569" style={{ alignSelf: 'center' }} />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
        {filteredItems.length === 0 ? (
          <View style={styles.section}>
            <Text style={styles.muted}>条件に一致するプロジェクトはありません。</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
