import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { applyToProject, updateProject, deleteProject } from '../data/store';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';
import { Feather } from '@expo/vector-icons';
import { ROLE_OPTIONS } from './CreateProjectScreen';

export default function ProjectDetailScreen({ route, setActiveSection }) {
  const { project } = route.params;
  const { user } = useAuth();

  // 応募用State
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');

  // 編集用State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const [editSummary, setEditSummary] = useState(project.summary);
  const [editRoles, setEditRoles] = useState(project.requiredRoles || []);

  const isMember = project.memberIds && project.memberIds.includes(user?.uid);
  const isOwner = project.ownerId === user?.uid;

  const showPrompt = (title, msg, options) => {
    if (Platform.OS === 'web') {
      const isOk = window.confirm(`${title}\n\n${msg}`);
      if (isOk) {
        options.find(o => o.style === 'destructive')?.onPress?.();
      }
    } else {
      Alert.alert(title, msg, options);
    }
  };

  const onApply = async () => {
    await applyToProject(project.id, user.uid, role || 'general', message || '参加希望です。');
    Alert.alert('申請完了', 'メンバーに追加されました。', [
      { text: 'OK', onPress: () => setActiveSection({ name: 'Workspace', params: { projectId: project.id } }) }
    ]);
  };

  const onSaveEdit = async () => {
    if (!editTitle.trim()) {
      Alert.alert('エラー', 'タイトルは必須です');
      return;
    }
    await updateProject(project.id, {
      title: editTitle,
      summary: editSummary,
      requiredRoles: editRoles
    });
    Alert.alert('更新完了', 'プロジェクト情報を更新しました。', [
      {
        text: 'OK', onPress: () => {
          project.title = editTitle;
          project.summary = editSummary;
          project.requiredRoles = editRoles;
          setIsEditing(false);
        }
      }
    ]);
  };

  const onDelete = () => {
    showPrompt('プロジェクト削除', '本当にこのプロジェクトを削除しますか？この操作は取り消せません。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除する', style: 'destructive', onPress: async () => {
          await deleteProject(project.id);
          if (Platform.OS === 'web') {
            window.alert('プロジェクトを削除しました。');
          } else {
            Alert.alert('削除完了', 'プロジェクトを削除しました。');
          }
          setActiveSection({ name: 'Projects' });
        }
      }
    ]);
  };

  const toggleEditRole = (r) => {
    setEditRoles(current =>
      current.includes(r) ? current.filter(x => x !== r) : [...current, r]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {isEditing ? (
        <View style={styles.section}>
          <Text style={styles.title}>プロジェクト情報の編集</Text>

          <Text style={[styles.text, { marginBottom: 4 }]}>プロジェクト名</Text>
          <TextInput
            style={styles.input}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholderTextColor="#94a3b8"
          />

          <Text style={[styles.text, { marginBottom: 4 }]}>プロジェクトの概要</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            value={editSummary}
            onChangeText={setEditSummary}
            placeholderTextColor="#94a3b8"
            multiline
          />

          <Text style={[styles.text, { marginTop: 12, marginBottom: 8, fontWeight: '700' }]}>募集ロール（複数選択可）</Text>
          <View style={{ marginBottom: 16 }}>
            {ROLE_OPTIONS.map((r) => {
              const isSelected = editRoles.includes(r);
              return (
                <TouchableOpacity
                  key={r}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                  onPress={() => toggleEditRole(r)}
                >
                  <View style={{
                    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
                    borderColor: isSelected ? '#4f46e5' : '#94a3b8',
                    backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
                    justifyContent: 'center', alignItems: 'center', marginRight: 12
                  }}>
                    {isSelected && <Feather name="check" size={16} color="#fff" />}
                  </View>
                  <Text style={{ color: '#1f2a44', fontSize: 16, flexShrink: 1 }}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={[styles.button, { marginBottom: 8 }]} onPress={onSaveEdit}>
            <Text style={styles.buttonText}>保存する</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setIsEditing(false)}>
            <Text style={[styles.buttonText, { color: '#1f2a44' }]}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.title, { marginBottom: 0, flex: 1 }]}>{project.title}</Text>
            {isOwner && (
              <View style={{ backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 12, color: '#4f46e5', fontWeight: '700' }}>オーナー</Text>
              </View>
            )}
            {isMember && !isOwner && (
              <View style={{ backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 12, color: '#059669', fontWeight: '700' }}>参加中</Text>
              </View>
            )}
          </View>

          <Text style={[styles.text, { marginBottom: 16, lineHeight: 22 }]}>{project.summary}</Text>

          <Text style={[styles.text, { fontWeight: '700', marginBottom: 8 }]}>募集ロール</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {project.requiredRoles && project.requiredRoles.length > 0 ? (
              project.requiredRoles.map((r, i) => (
                <View key={i} style={[styles.chip, { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }]}>
                  <Text style={{ color: '#475569', fontSize: 14 }}>{r}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.muted}>指定なし</Text>
            )}
          </View>

          <Text style={[styles.text, { fontWeight: '700', marginBottom: 8 }]}>作成者の所属高専</Text>
          <Text style={[styles.text, { marginBottom: 16 }]}>{project.kosenName || '未設定'}</Text>

          {isOwner && (
            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 16, marginTop: 8 }}>
              <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 8, backgroundColor: '#f8fafc', borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#cbd5e1' }} onPress={() => setIsEditing(true)}>
                <Feather name="edit-2" size={16} color="#334155" style={{ marginRight: 6 }} />
                <Text style={{ color: '#334155', fontWeight: '700' }}>プロジェクトを編集</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 8, backgroundColor: '#fef2f2', borderRadius: 8, borderWidth: 1, borderColor: '#fca5a5' }} onPress={onDelete}>
                <Feather name="trash-2" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                <Text style={{ color: '#ef4444', fontWeight: '700' }}>プロジェクトを削除</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {!isEditing && (
        <View style={styles.section}>
          {isMember ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Feather name="check-circle" size={48} color="#059669" style={{ marginBottom: 16 }} />
              <Text style={[styles.text, { fontSize: 16, fontWeight: '700', marginBottom: 24, textAlign: 'center' }]}>
                {isOwner ? 'あなたはこのプロジェクトのオーナーです' : 'あなたはこのプロジェクトに参加しています'}
              </Text>
              <TouchableOpacity
                style={[styles.button, { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
                onPress={() => setActiveSection({ name: 'Workspace', params: { projectId: project.id } })}
              >
                <Feather name="message-square" size={20} color="#1f2a44" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>ワークスペースを開く</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={[styles.text, { marginBottom: 12, fontWeight: '700', fontSize: 16 }]}>このプロジェクトに参加申請する</Text>

              <Text style={[styles.text, { marginBottom: 8 }]}>希望ロール</Text>
              <TextInput
                style={styles.input}
                value={role}
                onChangeText={setRole}
                placeholder="例: フロントエンド開発"
                placeholderTextColor="#94a3b8"
              />

              <Text style={[styles.text, { marginTop: 8, marginBottom: 8 }]}>自己PR・メッセージ</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                value={message}
                onChangeText={setMessage}
                placeholder="参加したい理由や、活かせるスキルなどを記入してください。"
                placeholderTextColor="#94a3b8"
                multiline
              />
              <TouchableOpacity style={[styles.button, { marginTop: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} onPress={onApply}>
                <Feather name="send" size={18} color="#1f2a44" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>申請を送信する</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
