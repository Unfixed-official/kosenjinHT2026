import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createProject } from '../data/store';
import { getKosenById, KOSEN_LOCATIONS } from '../data/kosenLocations';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';
import MapPanel from '../ui/MapPanel';

const ROLE_OPTIONS = ['フロントエンド', 'バックエンド', 'デザイナー', 'その他'];

export default function CreateProjectScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [otherRoleText, setOtherRoleText] = useState('');
  const [selectedKosenId, setSelectedKosenId] = useState(null);
  const [step, setStep] = useState('form');

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

  const moveToMapStep = () => {
    if (!validateBasic()) return;
    setStep('map');
  };

  const onCreate = async () => {
    if (!validateBasic()) return;
    if (!selectedKosenId) {
      Alert.alert('入力不足', '地図上で高専を選択してください。');
      return;
    }

    const normalizedRoles = selectedRoles
      .filter((r) => r !== 'その他')
      .concat(hasOther ? [otherRoleText.trim()] : []);

    const projectId = await createProject(user.uid, {
      title,
      summary,
      requiredRoles: normalizedRoles,
      kosenId: selectedKosenId
    });
    setTitle('');
    setSummary('');
    setSelectedRoles([]);
    setOtherRoleText('');
    setSelectedKosenId(null);
    setStep('form');
    Alert.alert('作成完了', `プロジェクトを作成しました: ${projectId}`);
  };

  if (step === 'map') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f1115', padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={[styles.title, { marginBottom: 0 }]}>高専を指定</Text>
          <Text style={styles.muted}>{selectedKosenId ? '選択済み' : '未選択'}</Text>
        </View>

        <MapPanel
          fullScreen
          selectedPinId={selectedKosenId}
          onPinPress={(pin) => setSelectedKosenId(pin.id)}
          pins={KOSEN_LOCATIONS.map((kosen) => ({
            id: kosen.id,
            x: kosen.x,
            y: kosen.y,
            title: kosen.name
          }))}
        />

        <Text style={[styles.muted, { marginTop: 8 }]}>選択中: {getKosenById(selectedKosenId)?.name || '-'}</Text>

        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary, { flex: 1, marginRight: 8 }]} onPress={() => setStep('form')}>
            <Text style={[styles.buttonText, { color: '#1f2a44' }]}>基本情報へ戻る</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { flex: 1, marginTop: 6 }]} onPress={onCreate}>
            <Text style={styles.buttonText}>この場所で作成</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

        <TouchableOpacity style={styles.button} onPress={moveToMapStep}>
          <Text style={styles.buttonText}>次へ（活動場所を指定）</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
