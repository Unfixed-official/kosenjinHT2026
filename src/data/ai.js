import { GoogleGenAI } from '@google/genai';
import { getUserProfile } from './store';

export async function generateAIResponse(uid, contextMessages) {
  try {
    const profile = await getUserProfile(uid);
    const apiKey = profile?.geminiKey;
    
    if (!apiKey) {
      return "【AI-PM】(Gemini APIキーが設定されていません。Profile画面の「開発者設定」からAPIキーを登録してください。)";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const formattedHistory = contextMessages.map(msg => {
      const role = msg.senderId === 'AI_PM' ? 'AIマネージャー' : msg.senderId;
      return `${role}: ${msg.text}`;
    }).join('\n');

    const prompt = `あなたは「AIプロジェクトマネージャー」です。
Kosen（高専）生のチーム開発において、プロジェクトマネージャーとしてメンバーを導いてください。
以下の会話の文脈を読み取り、プロジェクトを前に進めるための次の一言（アドバイス、タスクの提案、スケジュールの確認、励ましなど）を簡潔に（2〜3文程度で）返信してください。

【会話履歴】
${formattedHistory}

AIマネージャーとしての返信：`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('AI Response Error:', error);
    return "【AI-PM】すみません、うまく思考をまとめることができませんでした。";
  }
}
