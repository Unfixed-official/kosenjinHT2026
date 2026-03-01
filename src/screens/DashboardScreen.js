import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { listMyProjects } from '../data/store';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';
import { Feather } from '@expo/vector-icons';

export default function DashboardScreen({ setActiveSection, navigation }) {
    const { user } = useAuth();
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProjects = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const projects = await listMyProjects(user.uid);
            setMyProjects(projects);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    return (
        <ScrollView style={styles.container}>
            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#c7d2fe', padding: 20, borderRadius: 12, alignItems: 'center' }}
                    onPress={() => setActiveSection('Create')}
                >
                    <Feather name="plus-circle" size={32} color="#1f2a44" style={{ marginBottom: 8 }} />
                    <Text style={{ color: '#1f2a44', fontWeight: '700', fontSize: 16 }}>プロジェクト作成</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#bfdbfe', padding: 20, borderRadius: 12, alignItems: 'center' }}
                    onPress={() => setActiveSection('Projects')}
                >
                    <Feather name="search" size={32} color="#1f2a44" style={{ marginBottom: 8 }} />
                    <Text style={{ color: '#1f2a44', fontWeight: '700', fontSize: 16 }}>プロジェクトを探す</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.title, { marginBottom: 12 }]}>参加中のプロジェクト</Text>

            {loading ? (
                <Text style={styles.text}>読み込み中...</Text>
            ) : myProjects.length === 0 ? (
                <View style={[styles.section, { paddingVertical: 32, alignItems: 'center' }]}>
                    <Text style={styles.muted}>まだ参加しているプロジェクトはありません。</Text>
                </View>
            ) : (
                myProjects.map((project) => (
                    <TouchableOpacity
                        key={project.id}
                        style={styles.section}
                        onPress={() => navigation.navigate('ProjectDetail', { project })}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.text, { fontWeight: '700', fontSize: 18, marginBottom: 4 }]}>{project.title}</Text>
                            <Text style={{ fontSize: 12, color: project.ownerId === user?.uid ? '#4f46e5' : '#059669', fontWeight: '700', backgroundColor: project.ownerId === user?.uid ? '#e0e7ff' : '#d1fae5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                {project.ownerId === user?.uid ? 'オーナー' : 'メンバー'}
                            </Text>
                        </View>
                        <Text style={[styles.text, { marginTop: 4 }]} numberOfLines={2}>{project.summary}</Text>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}
