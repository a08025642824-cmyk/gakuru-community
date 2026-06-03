import { auth } from "@clerk/nextjs/server";
import { db } from "../../../../db/index";
import { projects } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/home");
  }

  const resolvedParams = await params;
  const projectId = resolvedParams.id;

  // 1. 現在のプロジェクト情報を取得
  const projectData = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  const project = projectData[0];

  if (!project) {
    return <div className="p-24 text-center">プロジェクトが見つかりません。</div>;
  }

  // 🌟 2. セキュリティ対策：オーナー以外が直接URLを叩いてアクセスしてきたら弾く！
  if (project.ownerId !== userId) {
    redirect(`/project/${projectId}`);
  }

  // 3. プロジェクト更新処理（Server Action）
  async function updateProject(formData: FormData) {
    "use server";
    const { userId } = await auth();
    // 念のためここでもオーナーチェック
    if (userId !== project.ownerId) return;

    // フォームから値を受け取る
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const progressStatus = formData.get("progressStatus") as string;
    const githubUrl = formData.get("githubUrl") as string;
    const figmaUrl = formData.get("figmaUrl") as string;
    const discordUrl = formData.get("discordUrl") as string;
    const documentUrl = formData.get("documentUrl") as string;
    const onboardingMemo = formData.get("onboardingMemo") as string;

    // 🌟 DBを上書き（update）する
    await db.update(projects)
      .set({
        title: title,
        description: description,
        progressStatus: progressStatus,
        githubUrl: githubUrl || null, // 空欄ならnullとして保存
        figmaUrl: figmaUrl || null,
        discordUrl: discordUrl || null,
        documentUrl: documentUrl || null,
        onboardingMemo: onboardingMemo || null,
      })
      .where(eq(projects.id, projectId));

    // キャッシュをクリアして詳細画面へ戻る
    revalidatePath(`/project/${projectId}`);
    redirect(`/project/${projectId}`);
  }

  return (
    <main className="max-w-2xl mx-auto p-8 mt-4">
      <Link href={`/project/${projectId}`} className="text-gray-500 hover:text-black mb-6 inline-block font-bold">
        ✕ キャンセルして戻る
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-6 border-b pb-4">✏️ プロジェクトを編集</h1>

        <form action={updateProject} className="space-y-6">
          
          {/* 🌟 1. 基本情報の編集 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">プロジェクト名</label>
              <input type="text" name="title" defaultValue={project.title} required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">概要・説明</label>
              <textarea name="description" defaultValue={project.description} required rows={4} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">現在のステータス</label>
              <select name="progressStatus" defaultValue={project.progressStatus} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="企画中">企画中（アイデア段階）</option>
                <option value="メンバー募集中">メンバー募集中</option>
                <option value="開発中">開発中</option>
                <option value="テスト中">テスト中</option>
                <option value="リリース済み">リリース済み🎉</option>
                <option value="停止中">停止中</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* 🌟 2. URL・リンクの追加 */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">🔗 外部リンク・ダッシュボード情報</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">GitHub URL</label>
              <input type="url" name="githubUrl" defaultValue={project.githubUrl || ""} placeholder="https://github.com/..." className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Discord 招待URL</label>
              <input type="url" name="discordUrl" defaultValue={project.discordUrl || ""} placeholder="https://discord.gg/..." className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Figma URL</label>
              <input type="url" name="figmaUrl" defaultValue={project.figmaUrl || ""} placeholder="https://www.figma.com/..." className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">その他ドキュメント（Notionなど）</label>
              <input type="url" name="documentUrl" defaultValue={project.documentUrl || ""} placeholder="https://..." className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* 🌟 3. メンバー向けメモ（合流メモ） */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">合流メモ（メンバーにだけ見えます）</label>
            <p className="text-xs text-gray-500 mb-2">参加してくれたメンバーへ最初に伝えたいことや、環境構築の手順などを書きます。</p>
            <textarea name="onboardingMemo" defaultValue={project.onboardingMemo || ""} rows={3} placeholder="例：まずはDiscordの「自己紹介」チャンネルで挨拶をお願いします！" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>

          {/* 🌟 保存ボタン */}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-md transition text-lg mt-8">
            更新内容を保存する
          </button>
          
        </form>
      </div>
    </main>
  );
}