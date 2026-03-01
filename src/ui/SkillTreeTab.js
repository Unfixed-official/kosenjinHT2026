import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import Svg, { Line, Circle, G, Text as SvgText } from 'react-native-svg';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const NODES = [
    { id: 'task_01', label: 'コンセプト・仕様策定', x: 500, y: 50, deps: [] },
    { id: 'task_02', label: 'エンジン構築', x: 500, y: 160, deps: ['task_01'] },
    { id: 'task_03', label: 'プレイヤー制御', x: 500, y: 270, deps: ['task_02'] },
    { id: 'task_04', label: '衝突判定・物理設定', x: 450, y: 380, deps: ['task_03'] },
    { id: 'task_05', label: 'キャラ原案・デザイン', x: 740, y: 160, deps: ['task_01'] },
    { id: 'task_06', label: 'キャラアセット制作', x: 740, y: 270, deps: ['task_05'] },
    { id: 'task_07', label: 'アニメーション実装', x: 740, y: 380, deps: ['task_03', 'task_06'] },
    { id: 'task_08', label: 'マップ設計', x: 260, y: 160, deps: ['task_01'] },
    { id: 'task_09', label: '背景アセット制作', x: 260, y: 270, deps: ['task_08'] },
    { id: 'task_10', label: '背景環境構築', x: 260, y: 380, deps: ['task_02', 'task_09'] },
    { id: 'task_11', label: '敵AI挙動ロジック', x: 400, y: 490, deps: ['task_04', 'task_09'] },
    { id: 'task_12', label: 'BGM作曲', x: 100, y: 160, deps: ['task_01'] },
    { id: 'task_13', label: '効果音(SE)制作', x: 280, y: 600, deps: ['task_03', 'task_11'] },
    { id: 'task_14', label: 'メニューUIシステム', x: 100, y: 270, deps: ['task_02'] },
    { id: 'task_15', label: 'HUD実装', x: 580, y: 380, deps: ['task_03'] },
    { id: 'task_16', label: 'セーブデータ保存', x: 100, y: 380, deps: ['task_14'] },
    { id: 'task_17', label: 'ネットワーク同期', x: 900, y: 160, deps: ['task_02'] },
    { id: 'task_18', label: 'バランス調整', x: 500, y: 600, deps: ['task_11', 'task_15'] },
    { id: 'task_19', label: 'ビルド・パッケージング', x: 500, y: 710, deps: ['task_18'] },
    { id: 'task_20', label: 'リリース・ストア公開', x: 500, y: 820, deps: ['task_19'] }
];

export default function SkillTreeTab({ projectId }) {
    const [nodeState, setNodeState] = useState({});

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'projects', projectId, 'system_configs', 'skillTree'), (snap) => {
            if (snap.exists()) {
                setNodeState(snap.data().nodes || {});
            } else {
                setNodeState({});
            }
        });
        return unsub;
    }, [projectId]);

    const updateState = async (updates) => {
        await setDoc(doc(db, 'projects', projectId, 'system_configs', 'skillTree'), {
            nodes: { ...nodeState, ...updates }
        }, { merge: true });
    };

    const showPrompt = (title, message, options) => {
        if (Platform.OS === 'web') {
            const isCancel = !window.confirm(`${title}\n\n${message}`);
            if (!isCancel) {
                options.find(o => o.text !== 'キャンセル' && o.text !== 'Cancel')?.onPress?.();
            }
        } else {
            Alert.alert(title, message, options);
        }
    };

    const getStatus = (node) => {
        if (nodeState[node.id]) return nodeState[node.id];

        if (node.deps.length === 0) return 'unreached';

        let depsDone = 0;
        node.deps.forEach(d => {
            if (nodeState[d] === 'done') depsDone++;
        });

        if (depsDone === node.deps.length) {
            return 'unreached'; // Ready, but unreached/unstarted.
        } else if (depsDone > 0) {
            return 'partial'; // Reached, but missing deps (Yellow)
        } else {
            return 'unreached'; // Locked (Gray)
        }
    };

    const getColor = (status) => {
        switch (status) {
            case 'done': return '#10b981'; // 緑
            case 'in_progress': return '#3b82f6'; // 青
            case 'partial': return '#eab308'; // 黄色
            case 'unreached':
            default: return '#94a3b8'; // 灰色
        }
    };

    const onNodePress = (node) => {
        const status = getStatus(node);
        let nextStatus = '';

        if (status === 'partial') {
            showPrompt('依存作業が残っています', '前のタスクを先に行うことをおすすめします。強制的に進行中（青色）にしますか？', [
                { text: 'キャンセル', style: 'cancel' },
                { text: '進行中にする', onPress: () => updateState({ [node.id]: 'in_progress' }) }
            ]);
            return;
        }

        if (status === 'unreached') {
            const isReady = node.deps.every(d => nodeState[d] === 'done');
            if (!isReady && node.deps.length > 0) {
                showPrompt('未到達タスク', '前のタスクを完了させていません。強制的に着手しますか？', [
                    { text: 'キャンセル', style: 'cancel' },
                    { text: '強制着手', onPress: () => updateState({ [node.id]: 'in_progress' }) }
                ]);
                return;
            }
        }

        if (status === 'unreached' || status === 'partial') {
            nextStatus = 'in_progress';
        } else if (status === 'in_progress') {
            nextStatus = 'done';
        } else if (status === 'done') {
            nextStatus = 'null_status'; // hacky string to represent removal
        }

        if (nextStatus) {
            if (nextStatus === 'null_status') {
                updateState({ [node.id]: null });
            } else {
                updateState({ [node.id]: nextStatus });
            }
        }
    };

    const EDGES = [];
    NODES.forEach(n => {
        n.deps.forEach(depId => {
            const dep = NODES.find(x => x.id === depId);
            if (dep) EDGES.push({ from: dep, to: n });
        });
    });

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <ScrollView horizontal={true} contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20, minWidth: '100%' }}>
                <View style={{ alignItems: 'center', width: 1000 }}>
                    {/* Legend */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}><View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', marginRight: 4 }} /><Text style={{ color: '#475569', fontSize: 13, fontWeight: '700' }}>達成済み</Text></View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}><View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3b82f6', marginRight: 4 }} /><Text style={{ color: '#475569', fontSize: 13, fontWeight: '700' }}>進行中</Text></View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}><View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#eab308', marginRight: 4 }} /><Text style={{ color: '#475569', fontSize: 13, fontWeight: '700' }}>一部事前タスク未了</Text></View>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20, marginTop: -10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}><View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#94a3b8', marginRight: 4 }} /><Text style={{ color: '#475569', fontSize: 13, fontWeight: '700' }}>未到達 / 未着手</Text></View>
                    </View>

                    <Text style={{ marginBottom: 20, color: '#64748b', fontSize: 12 }}>※アイコンをタップして状態を切り替えます</Text>

                    <Svg width="1000" height="900" style={{ backgroundColor: 'transparent' }}>
                        {EDGES.map((edge, i) => {
                            const fromStatus = getStatus(edge.from);
                            const activePath = fromStatus === 'done' || fromStatus === 'in_progress';
                            return (
                                <Line
                                    key={i}
                                    x1={edge.from.x} y1={edge.from.y}
                                    x2={edge.to.x} y2={edge.to.y}
                                    stroke={activePath ? '#94a3b8' : '#e2e8f0'}
                                    strokeWidth={activePath ? 3 : 2}
                                    strokeDasharray={activePath ? '' : '5,5'}
                                />
                            );
                        })}

                        {NODES.map((node) => {
                            const status = getStatus(node);
                            const color = getColor(status);
                            const isDone = status === 'done';

                            return (
                                <G key={node.id} onPress={() => onNodePress(node)}>
                                    <Circle cx={node.x} cy={node.y} r={28} fill="#fff" stroke={color} strokeWidth={4} />
                                    <Circle cx={node.x} cy={node.y} r={18} fill={isDone ? color : (status === 'in_progress' ? '#bfdbfe' : '#fff')} />
                                    {isDone && (
                                        <SvgText x={node.x} y={node.y + 6} fontSize="18" fill="#fff" textAnchor="middle">✓</SvgText>
                                    )}
                                    <SvgText
                                        x={node.x}
                                        y={node.y + 45}
                                        fontSize="14"
                                        fontWeight="700"
                                        fill="#1e293b"
                                        textAnchor="middle"
                                    >
                                        {node.label}
                                    </SvgText>
                                </G>
                            );
                        })}
                    </Svg>
                </View>
            </ScrollView>
        </ScrollView>
    );
}
