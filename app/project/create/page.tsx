import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "../../../db/index";
import { projects, projectMembers } from "../../../db/schema";
import Link from "next/link";

export default async function CreateProjectPage() {
  const { userId } = await auth();
  
  // ログインしていない場合はトップページへ
  if (!userId) {
    redirect("/");
  }

  // プロジェクトを保存する処理（Server Action）
  async function submitProject(formData: FormData) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;

    const projectId = crypto.randomUUID();
    
    // フォームから入力値を受け取る
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const progressStatus = formData.get("progressStatus") as string;
    const onboardingMemo = formData.get("onboardingMemo") as string;
    
    // チェックボックスはチェックされていれば "on" という文字列が来る
    const isOpenToAll = formData.get("isOpenToAll") === "on";
    
    // カンマ区切りの募集ポジションを配列に変換
    const rolesInput = formData.get("recruitingRoles") as string;
    const recruitingRoles = rolesInput
      .split(",")
      .map(r => r.trim())
      .filter(r => r !== "");

    // ツールリンク類
    const githubUrl = formData.get("githubUrl") as string;
    const figmaUrl = formData.get("figmaUrl") as string;
    const discordUrl = formData.get("discordUrl") as string;
    const documentUrl = formData.get("documentUrl") as string;

    // 1. プロジェクト本体を保存
    await db.insert(projects).values({
      id: projectId,
      ownerId: userId,
      title,
      description,
      progressStatus,
      onboardingMemo,
      recruitingRoles,
      isOpenToAll,
      githubUrl,
      figmaUrl,
      discordUrl,
      documentUrl,
      createdAt: new Date(),
    });

    // 2. 作成者を最初のメンバー（発起人）として名簿に追加！
    await db.insert(projectMembers).values({
      id: crypto.randomUUID(),
      projectId: projectId,
      userId: userId,
      roleText: "発起人 / オーナー",
      status: "approved", // 自分で作ったので最初から承認済み
      createdAt: new Date(),
    });

    // 🌟 一旦トップページに戻す（あとでプロジェクト詳細画面ができたらそっちに飛ばします）
    redirect("/");
  }

  return (
    <main className="max-w-3xl mx-auto p-8 mt-4">
      <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block font-bold">
        ← トップに戻る
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">新しいプロジェクトを立ち上げる</h1>
        <p className="text-gray-500 mb-8">アイデアを形にするための仲間を集めましょう！</p>

        <form action={submitProject} className="space-y-8">
          
          {/* ▼ セクション1：基本情報 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">1. 基本情報</h2>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">プロジェクト名 <span className="text-red-500">*</span></label>
              <input type="text" name="title" required className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例：次世代のタスク管理アプリ開発" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">プロジェクトの概要・目的 <span className="text-red-500">*</span></label>
              <textarea name="description" required rows={4} className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="どんな課題を解決したいか、どんな世界を作りたいか熱意を書きましょう！" />
            </div>
          </div>

          {/* ▼ セクション2：募集について */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">2. 募集と進捗</h2>
            
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">現在の進捗状況</label>
              <select name="progressStatus" className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="💡 アイデア出し・企画中">💡 アイデア出し・企画中</option>
                <option value="🎨 デザイン・プロトタイプ作成中">🎨 デザイン・プロトタイプ作成中</option>
                <option value="💻 絶賛開発中">💻 絶賛開発中</option>
                <option value="🚀 リリース直前・テスト中">🚀 リリース直前・テスト中</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">募集する専門ポジション（カンマ区切り）</label>
              <input type="text" name="recruitingRoles" className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="例：フロントエンド, UIデザイナー, マーケター" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 border rounded bg-white hover:bg-gray-50 transition">
              <input type="checkbox" name="isOpenToAll" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <div>
                <p className="font-bold text-gray-800">専門外の分野でも大歓迎！</p>
                <p className="text-xs text-gray-500">アイデア出し、テスター、応援係など、スキル問わず巻き込みたい場合はチェック。</p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">途中参加者のための合流メモ</label>
              <textarea name="onboardingMemo" rows={2} className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="例：まずはNotionの議事録を読んで、Discordの「自己紹介」チャンネルで挨拶してね！" />
            </div>
          </div>

          {/* ▼ セクション3：ツール連携（あとからでもOK） */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">3. 開発ツール連携 (任意)</h2>
            <p className="text-sm text-gray-500 mb-4">すでに用意しているツールがあればURLを貼ってください。参加者のみに表示されます。</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">GitHub (コード管理)</label>
                <input type="url" name="githubUrl" className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Discord (通話・チャット)</label>
                <input type="url" name="discordUrl" className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://discord.gg/..." />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Figma (デザイン)</label>
                <input type="url" name="figmaUrl" className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://figma.com/..." />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Notion等 (ドキュメント)</label>
                <input type="url" name="documentUrl" className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://notion.so/..." />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-lg text-lg transition shadow-md">
            🚀 この内容でプロジェクトを立ち上げる
          </button>
        </form>
      </div>
    </main>
  );
}