import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../state/AuthContext';
import { styles } from '../ui/styles';
import { QuintetLogoSquare } from '../ui/QuintetLogo';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
    const { signInWithGoogle, user } = useAuth();
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        try {
            setError(null);
            await signInWithGoogle();
        } catch (e) {
            setError(e.message || 'ログインに失敗しました');
        }
    };

    return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1115' }]}>
            <View style={[styles.section, { width: '80%', maxWidth: 400, alignItems: 'center', backgroundColor: '#181b22', borderColor: '#2a2f3b' }]}>
                <QuintetLogoSquare size={80} color="#7dd3fc" />
                <Text style={[styles.title, { color: '#f1f5f9', marginTop: 20, marginBottom: 8, fontSize: 24 }]}>Quintet Project</Text>
                <Text style={[styles.text, { color: '#94a3b8', textAlign: 'center', marginBottom: 30 }]}>
                    高専生のためのプロジェクトマッチング
                </Text>

                {error ? (
                    <Text style={{ color: '#ef4444', marginBottom: 16 }}>{error}</Text>
                ) : null}

                <TouchableOpacity
                    style={[styles.button, { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }]}
                    onPress={handleLogin}
                >
                    <Feather name="globe" size={20} color="#1f2a44" style={{ marginRight: 10 }} />
                    <Text style={[styles.buttonText, { color: '#1f2a44' }]}>Googleでログイン</Text>
                </TouchableOpacity>

                <Text style={[styles.text, { color: '#64748b', fontSize: 12, marginTop: 20, textAlign: 'center' }]}>
                    ※高専のGoogle Workspaceアカウントのご利用を推奨します
                </Text>
            </View>
        </View>
    );
}
