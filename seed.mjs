import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAX1t7qs2DKaGyPgknR-UEVMFAiaOkSTW0",
    authDomain: "quintet-project-fa7a7.firebaseapp.com",
    projectId: "quintet-project-fa7a7",
    storageBucket: "quintet-project-fa7a7.firebasestorage.app",
    messagingSenderId: "916695863004",
    appId: "1:916695863004:web:e285482fcc76f09096ae19",
    measurementId: "G-BZKXH8ZJEP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dummyOwnerId = "dummy-owner-123";

const MOCK_PROJECTS = [
    {
        title: "高専生のためのポートフォリオサイト",
        summary: "高専生の作品や履歴を簡単にまとめることができるポートフォリオ作成サービスです。モダンなUI/UXと生成AIの活用によりプロフィールの自動作成機能を目指します。",
        requiredRoles: ["フロントエンド開発（Web / モバイル）", "UIデザイン", "UX設計"],
        kosenId: "01",
        kosenName: "函館工業高等専門学校"
    },
    {
        title: "スマート農業モニタリングIoT拠点",
        summary: "温度・湿度・土壌水分などのセンサーデータをリアルタイムで収集し、ダッシュボードから一元管理できるシステムを作ります。ハードからクラウドまで総合的に開発します。",
        requiredRoles: ["ハードウェア・IoT開発", "バックエンド開発（API / DB設計）", "インフラ・クラウド構築"],
        kosenId: "02",
        kosenName: "苫小牧工業高等専門学校"
    },
    {
        title: "機械学習ベースのコードレビューBot",
        summary: "GitHubのPull Requestに対して、レビューコメントを自動生成してくれるツールを作ります。特にC言語やPythonなどに特化した独自のモデルを調整したいです。",
        requiredRoles: ["AI・機械学習", "バックエンド開発（API / DB設計）"],
        kosenId: "13",
        kosenName: "仙台高等専門学校"
    },
    {
        title: "キャンパスマップ3Dナビゲーション",
        summary: "広大な高専キャンパス内で迷わないよう、3Dモデリングを用いたブラウザ向けナビゲーションアプリを作ります。文化祭などのイベントでも活用できるようにしたいです。",
        requiredRoles: ["3Dモデリング", "フロントエンド開発（Web / モバイル）"],
        kosenId: "36",
        kosenName: "豊田工業高等専門学校"
    },
    {
        title: "ハッカソンプロモーション動画制作",
        summary: "直近で開催される高専生向けハッカソンの魅力を伝える紹介映像を制作します。3DCGやモーショングラフィックスを用いたカッコいい映像に仕上げたいです。",
        requiredRoles: ["動画制作・モーショングラフィック", "3Dモデリング", "UIデザイン"],
        kosenId: "51",
        kosenName: "呉工業高等専門学校"
    } // 5 items
];

async function seed() {
    console.log('Seeding dummy projects...');
    for (const proj of MOCK_PROJECTS) {
        const projectRef = doc(collection(db, 'projects'));

        await setDoc(projectRef, {
            id: projectRef.id,
            ownerId: dummyOwnerId,
            title: proj.title,
            summary: proj.summary,
            requiredRoles: proj.requiredRoles,
            kosenId: proj.kosenId,
            kosenName: proj.kosenName,
            location: null,
            status: 'recruiting',
            createdAt: Date.now(),
            memberIds: [dummyOwnerId]
        });

        const channelRef = doc(collection(db, 'projects', projectRef.id, 'channels'));
        await setDoc(channelRef, {
            id: channelRef.id,
            name: 'general',
            type: 'text',
            isPrivate: false,
            position: 1
        });

        const msgRef = doc(collection(db, 'projects', projectRef.id, 'channels', channelRef.id, 'messages'));
        await setDoc(msgRef, {
            id: msgRef.id,
            senderId: 'AI_PM',
            text: 'プロジェクトが作成されました！本プロジェクトの進行は、私「AIプロジェクトマネージャー」がサポートします。\nメンバーが揃うまで、もう少しお待ち下さい。',
            createdAt: Date.now()
        });
        console.log(`Created project: ${proj.title}`);
    }
    console.log('Seeding complete.');
    process.exit(0);
}

seed().catch(console.error);
