import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { sendMessage, subscribeChannels, subscribeMessages } from '../data/store';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';
import { Feather } from '@expo/vector-icons';
import SkillTreeTab from '../ui/SkillTreeTab';

export default function WorkspaceScreen({ route }) {
  const { projectId } = route.params;
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'skillTree'

  useEffect(() => {
    const unsubscribe = subscribeChannels(projectId, (next) => {
      setChannels(next);
      if (!selectedChannelId && next.length) {
        setSelectedChannelId(next[0].id);
      }
    });
    return unsubscribe;
  }, [projectId, selectedChannelId]);

  useEffect(() => {
    if (!selectedChannelId) return undefined;
    const unsubscribe = subscribeMessages(projectId, selectedChannelId, setMessages);
    return unsubscribe;
  }, [projectId, selectedChannelId]);

  const channelName = useMemo(
    () => channels.find((c) => c.id === selectedChannelId)?.name || 'general',
    [channels, selectedChannelId]
  );

  const onSend = async () => {
    await sendMessage(projectId, selectedChannelId, user.uid, input);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d4def5', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => setActiveTab('chat')} style={{ flex: 1, padding: 12, borderBottomWidth: activeTab === 'chat' ? 2 : 0, borderBottomColor: '#4f46e5', alignItems: 'center' }}>
          <Text style={{ fontWeight: activeTab === 'chat' ? '700' : '400', color: activeTab === 'chat' ? '#1f2a44' : '#64748b' }}>チャット</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('skillTree')} style={{ flex: 1, padding: 12, borderBottomWidth: activeTab === 'skillTree' ? 2 : 0, borderBottomColor: '#4f46e5', alignItems: 'center' }}>
          <Text style={{ fontWeight: activeTab === 'skillTree' ? '700' : '400', color: activeTab === 'skillTree' ? '#1f2a44' : '#64748b' }}>スキルツリー</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'skillTree' ? (
        <View style={[styles.section, { flex: 1, padding: 0, overflow: 'hidden' }]}>
          <SkillTreeTab projectId={projectId} />
        </View>
      ) : (
        <>
          <View style={[styles.section, { flexDirection: 'row', flexWrap: 'wrap' }]}>
            {channels.map((channel) => (
              <TouchableOpacity
                key={channel.id}
                style={[
                  styles.chip,
                  selectedChannelId === channel.id ? { backgroundColor: '#c7d2fe' } : undefined
                ]}
                onPress={() => setSelectedChannelId(channel.id)}
              >
                <Text style={{ color: selectedChannelId === channel.id ? '#1f2a44' : '#64748b', fontWeight: selectedChannelId === channel.id ? '700' : '500' }}>
                  #{channel.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.text, { marginBottom: 8, fontWeight: '700' }]}>#{channelName}</Text>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isAI = item.senderId === 'AI_PM';
                return (
                  <View style={{
                    marginBottom: 12,
                    backgroundColor: isAI ? '#f0f5ff' : 'transparent',
                    padding: isAI ? 12 : 0,
                    borderRadius: isAI ? 12 : 0,
                    borderWidth: isAI ? 1 : 0,
                    borderColor: '#c7d2fe'
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      {isAI ? (
                        <Feather name="cpu" size={16} color="#4f46e5" style={{ marginRight: 6 }} />
                      ) : (
                        <Feather name="user" size={16} color="#64748b" style={{ marginRight: 6 }} />
                      )}
                      <Text style={[styles.muted, { marginTop: 0, fontWeight: isAI ? '700' : '400', color: isAI ? '#4f46e5' : '#64748b' }]}>
                        {isAI ? 'AI プロジェクトマネージャー' : item.senderId}
                      </Text>
                    </View>
                    <Text style={[styles.text, { paddingLeft: 22, lineHeight: 20 }]}>{item.text}</Text>
                  </View>
                );
              }}
            />
          </View>

          <View style={[styles.section, { marginBottom: 0 }]}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="メッセージ"
              placeholderTextColor="#94a3b8"
              onSubmitEditing={onSend}
            />
            <TouchableOpacity style={styles.button} disabled={!selectedChannelId} onPress={onSend}>
              <Text style={styles.buttonText}>送信</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
