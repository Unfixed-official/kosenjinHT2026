import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KOSEN_MAP } from '../data/kosenLocations';
import { listProjects } from '../data/store';
import { styles } from '../ui/styles';
import MapPanel from '../ui/MapPanel';

const ROLE_FILTER_OPTIONS = ['フロントエンド', 'バックエンド', 'デザイナー', 'その他'];
const BASE_ROLES = ['フロントエンド', 'バックエンド', 'デザイナー'];

export default function ProjectsScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [roleFilters, setRoleFilters] = useState([]);
  const [selectedKosenId, setSelectedKosenId] = useState(null);

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
  const groupedByKosen = filteredItems.reduce((acc, project) => {
    if (!project.kosenId || !KOSEN_MAP[project.kosenId]) return acc;
    if (!acc[project.kosenId]) {
      acc[project.kosenId] = {
        ...KOSEN_MAP[project.kosenId],
        projects: []
      };
    }
    acc[project.kosenId].projects.push(project);
    return acc;
  }, {});

  const kosenPins = Object.values(groupedByKosen).map((group) => ({
    id: group.id,
    x: group.x,
    y: group.y,
    title: group.name,
    rolesText: `${group.projects.length}件のプロジェクト`,
    count: group.projects.length
  }));

  const selectedKosenProjects = selectedKosenId ? groupedByKosen[selectedKosenId]?.projects || [] : [];

  return (
    <View style={[styles.container, { paddingBottom: 10 }]}>
      <View style={[styles.section, { marginBottom: 10 }]}> 
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: activeTab === 'search' ? '#c7d2fe' : '#eef2ff' }]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={{ color: '#1f2a44', fontWeight: '700' }}>検索</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: activeTab === 'map' ? '#c7d2fe' : '#eef2ff' }]}
            onPress={() => setActiveTab('map')}
          >
            <Text style={{ color: '#1f2a44', fontWeight: '700' }}>マップ</Text>
          </TouchableOpacity>
        </View>
      </View>

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

      {activeTab === 'map' ? (
        <View style={{ flex: 1 }}>
          <MapPanel
            fullScreen
            selectedPinId={selectedKosenId}
            onPinPress={(pin) => setSelectedKosenId(pin.id)}
            pins={kosenPins}
            showLabelsAtZoom={1.25}
          />

          <View style={[styles.section, { marginTop: 10 }]}>
            <Text style={[styles.text, { fontSize: 17, marginBottom: 6 }]}>選択中の高専: {KOSEN_MAP[selectedKosenId]?.name || '-'}</Text>
            {selectedKosenProjects.length === 0 ? (
              <Text style={styles.muted}>地図のピンをクリックすると、その高専のプロジェクト一覧が表示されます。</Text>
            ) : (
              <ScrollView style={{ maxHeight: 230 }}>
                {selectedKosenProjects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[styles.section, { marginBottom: 8 }]}
                    onPress={() => navigation.navigate('ProjectDetail', { project })}
                  >
                    <Text style={[styles.text, { fontWeight: '700', marginBottom: 4 }]}>{project.title}</Text>
                    <Text style={styles.text}>{project.summary}</Text>
                    <Text style={styles.muted}>roles: {(project.requiredRoles || []).join(', ') || '-'}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {filteredItems.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.section}
              onPress={() => navigation.navigate('ProjectDetail', { project })}
            >
              <Text style={[styles.text, { fontWeight: '700', marginBottom: 4 }]}>{project.title}</Text>
              <Text style={styles.text}>{project.summary}</Text>
              <Text style={styles.muted}>kosen: {project.kosenName || '-'}</Text>
              <Text style={styles.muted}>roles: {(project.requiredRoles || []).join(', ') || '-'}</Text>
              <Text style={styles.muted}>status: {project.status}</Text>
            </TouchableOpacity>
          ))}
          {filteredItems.length === 0 ? (
            <View style={styles.section}>
              <Text style={styles.muted}>条件に一致するプロジェクトはありません。</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
