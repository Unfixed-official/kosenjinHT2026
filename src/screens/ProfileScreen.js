import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { getUserProfile, upsertUserProfile } from '../data/store';
import { KOSEN_LOCATIONS, getKosenById } from '../data/kosenLocations';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';
import { Feather } from '@expo/vector-icons';

const AVAILABLE_SKILLS = [
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

export default function ProfileScreen() {
  const { user, logOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [kosenId, setKosenId] = useState(null);
  const [skills, setSkills] = useState([]);
  const [achievements, setAchievements] = useState('');
  const [bio, setBio] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((profile) => {
      if (!profile) return;
      setDisplayName(profile.displayName || '');
      setKosenId(profile.kosenId || null);
      setSkills(profile.skills || []);
      setAchievements(profile.achievements || '');
      setBio(profile.bio || '');
      setGeminiKey(profile.geminiKey || '');
    });
  }, [user]);

  const onSave = async () => {
    if (!user) return;
    await upsertUserProfile(user.uid, {
      displayName: displayName || user.displayName || '名無し',
      kosenId: kosenId,
      skills: skills,
      achievements: achievements,
      bio: bio,
      geminiKey: geminiKey.trim(),
    });
    Alert.alert('保存完了', 'プロフィールを更新しました。');
  };

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>プロフィール</Text>

        {/* ユーザーアイコン (表示のみ) */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#eef4ff' }} />
          ) : (
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#eef4ff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#c7d2fe' }}>
              <Feather name="user" size={40} color="#64748b" />
            </View>
          )}
        </View>

        <Text style={[styles.text, { marginBottom: 4 }]}>ニックネーム</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="あなたのニックネーム"
          placeholderTextColor="#94a3b8"
        />

        <Text style={[styles.text, { marginBottom: 4 }]}>所属高専</Text>
        <TouchableOpacity
          style={[styles.input, { justifyContent: 'center' }]}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={{ color: kosenId ? '#1f2a44' : '#94a3b8' }}>
            {kosenId ? getKosenById(kosenId)?.name : '高専を選択してください'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.text, { marginTop: 16, marginBottom: 8, fontWeight: '700' }]}>スキル</Text>
        <View style={{ marginBottom: 16 }}>
          {AVAILABLE_SKILLS.map((skill) => {
            const isSelected = skills.includes(skill);
            return (
              <TouchableOpacity
                key={skill}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                onPress={() => toggleSkill(skill)}
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
                <Text style={{ color: '#1f2a44', fontSize: 16, flexShrink: 1 }}>{skill}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.text, { marginBottom: 4 }]}>実績</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          value={achievements}
          onChangeText={setAchievements}
          placeholder="（例）インターン経験、開発コンテスト受賞歴、作成したアプリなど"
          placeholderTextColor="#94a3b8"
          multiline
        />

        <Text style={[styles.text, { marginBottom: 4 }]}>自由記述欄</Text>
        <TextInput
          style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
          value={bio}
          onChangeText={setBio}
          placeholder="自己紹介や興味のある分野、意気込みなどを自由に書いてください"
          placeholderTextColor="#94a3b8"
          multiline
        />

        <View style={{ height: 1, backgroundColor: '#d4def5', marginVertical: 24 }} />

        <Text style={[styles.text, { marginBottom: 4, fontWeight: '700' }]}>開発者設定（AI PM用）</Text>
        <TextInput
          style={styles.input}
          value={geminiKey}
          onChangeText={setGeminiKey}
          placeholder="Gemini API Key"
          placeholderTextColor="#94a3b8"
          secureTextEntry={true}
        />

        <TouchableOpacity style={[styles.button, { marginTop: 24 }]} onPress={onSave}>
          <Text style={styles.buttonText}>保存</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={logOut}>
          <Text style={[styles.buttonText, { color: '#f1f5f9' }]}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={pickerVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 12, maxHeight: '80%', padding: 10, borderWidth: 1, borderColor: '#d4def5' }}>
            <Text style={[styles.title, { padding: 10, marginBottom: 0, color: '#1f2a44' }]}>高専を選択</Text>
            <ScrollView style={{ padding: 10 }}>
              {KOSEN_LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#d4def5' }}
                  onPress={() => {
                    setKosenId(loc.id);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16, color: loc.id === kosenId ? '#4f46e5' : '#1f2a44', fontWeight: loc.id === kosenId ? '700' : '400' }}>
                    {loc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]} onPress={() => setPickerVisible(false)}>
              <Text style={[styles.buttonText, { color: '#1f2a44' }]}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
