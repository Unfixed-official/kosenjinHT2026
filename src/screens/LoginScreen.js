import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { signInDiscord, signInGoogle, signInGuest, signInX } from '../firebase/auth';
import { styles } from '../ui/styles';

async function runLogin(fn) {
  const result = await fn();
  if (result?.ok === false) {
    Alert.alert('ログイン設定未完了', result.reason);
  }
}

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const onTap = async (fn) => {
    setLoading(true);
    try {
      await runLogin(fn);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Quintet Project</Text>
        <Text style={styles.text}>5人制作チームのための最小MVP</Text>
        <Text style={styles.muted}>MVPではゲストログインで全機能確認できます</Text>

        <TouchableOpacity style={styles.button} disabled={loading} onPress={() => onTap(signInGoogle)}>
          <Text style={styles.buttonText}>Googleでログイン</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          disabled={loading}
          onPress={() => onTap(signInDiscord)}
        >
          <Text style={[styles.buttonText, { color: '#f1f5f9' }]}>Discordでログイン</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          disabled={loading}
          onPress={() => onTap(signInX)}
        >
          <Text style={[styles.buttonText, { color: '#f1f5f9' }]}>Xでログイン</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { marginTop: 12 }]} disabled={loading} onPress={() => onTap(signInGuest)}>
          <Text style={styles.buttonText}>ゲストで開始</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
