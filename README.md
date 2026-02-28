# Quintet Project MVP (最小版)

React Native (Expo) だけで動く、認証なし・Firebaseなしの最小MVPです。

## この版でできること

- 認証なしで即利用開始
- プロフィール編集（ローカルメモリ）
- プロジェクト作成・検索
- 参加申請（pending）と承認（provisional member）
- Discordライクなチャンネルチャット（general）

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

1. Expo起動

```bash
npm run start
```

## 実装メモ

- データ保存先は `src/data/store.js` のインメモリ状態です。
- アプリ再起動でデータはリセットされます。
- ユーザーは `Profile` タブの「ユーザー再生成」で切り替えできます。
