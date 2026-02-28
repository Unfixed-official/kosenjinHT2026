# Quintet Project MVP (最小版)

React Native (Expo) + Firebase で構築した最小MVPです。

## この版でできること

- 認証画面（Google/Discord/Xボタン + ゲストログイン）
- プロフィール登録（役職/実績）
- プロジェクト作成・検索
- 参加申請（pending）とオーナー承認（provisional member）
- Discordライクなチャンネルチャット（general）
- 信頼担保の骨格（解雇リクエスト投票、収益配分プレビュー）

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

1. Firebase Functions依存関係をインストール

```bash
cd functions
npm install
cd ..
```

1. `.env.example` を `.env` にコピーして Firebase 値を設定

```bash
copy .env.example .env
```

1. Expo起動

```bash
npm run start
```

## Firestore想定コレクション

- `users/{uid}`
- `projects/{projectId}`
- `projects/{projectId}/applications/{uid}`
- `projects/{projectId}/members/{uid}`
- `projects/{projectId}/channels/{channelId}/messages/{messageId}`
- `projects/{projectId}/contracts/{contractId}`
- `projects/{projectId}/governance/removalRequests/items/{requestId}`
- `projects/{projectId}/distributionRuns/{runId}`

## 信頼担保ロジック（最小）

- クライアントからの即時解雇は禁止（Rules + Functionsで制御）
- 解雇は `requestMemberRemoval -> voteMemberRemoval -> finalizeMemberRemoval` の3段階
- 収益配分は `previewDistribution` で計算のみ（決済連携前提の骨格）

## 注意

- Google/Discord/X の実OAuthはFirebase Console設定が必要です。MVP最小版ではボタンを先行配置し、ゲストログインで機能確認できます。
- 本番前に Firestore Indexes / Security Rules の詳細化、Cloud Functions の検証、監査ログ追加を実施してください。
