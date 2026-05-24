import { auth } from "@clerk/nextjs/server";
import { db } from "../../../db/index";
import { users, threads, projects } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { userId: myId } = await auth();
  const resolvedParams = await params;
  const targetUserId = resolvedParams.id;

  // 1. 対象のユーザー情報を取得
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  const targetUser = userData[0];

  if (!targetUser) {
    return <div className="p-24 text-center text-gray-500">ユーザーが見つかりません。</div>;
  }

  // 2. この人が作ったプロジェクトを取得
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, targetUserId))
    .orderBy(desc(projects.createdAt));

  // 3. この人が立てたスレッドを取得
  const userThreads = await db
    .select()
    .from(threads)
    .where(eq(threads.authorId, targetUserId))
    .orderBy(desc(threads.createdAt));

  const skillsArray = Array.isArray(targetUser.skills) ? targetUser.skills : [];

  return (
    <main className="max-w-3xl mx-auto p-8 mt-4">
      <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block font-bold">
        ← トップに戻る
      </Link>

      {/* ▼ プロフィールカード */}
      <div className="bg-white p-8 rounded-lg shadow-sm border mb-8 relative">
        
        {/* 🌟 DMボタン（自分以外のプロフィールを見ている時だけ表示） */}
        {myId && myId !== targetUserId && (
          <div className="absolute top-6 right-6">
            <Link href={`/dm/${targetUserId}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full shadow-sm transition flex items-center gap-2 text-sm">
              ✉️ DMを送る
            </Link>
          </div>
        )}
        
        {/* 自分の場合は編集ボタン */}
        {myId === targetUserId && (
          <div className="absolute top-6 right-6">
            <Link href="/mypage" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-full border transition flex items-center gap-2 text-sm">
              ✏️ 編集する
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
          {targetUser.avatarUrl ? (
            <img src={targetUser.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full shadow-sm" />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full shadow-sm" />
          )}
          
          <div className="flex-1 pr-32">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              {targetUser.name}
            </h1>
            
            <div className="flex gap-2 flex-wrap mb-4">
              {skillsArray.map((skill: string, index: number) => (
                <span key={index} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
            
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {targetUser.bio ? targetUser.bio : "自己紹介はまだありません。"}
            </p>

            {/* 🌟 ポートフォリオURLがあれば表示 */}
            {targetUser.portfolioUrl && (
              <div className="mt-4 inline-block bg-gray-50 border px-4 py-2 rounded-lg">
                <div className="text-[10px] text-gray-500 font-bold mb-1">ポートフォリオ / リンク</div>
                <a href={targetUser.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1">
                  🔗 {targetUser.portfolioUrl} ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ▼ このユーザーの活動履歴 */}
      <div className="space-y-8">
        
        {/* プロジェクト一覧 */}
        {userProjects.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
              🚀 立ち上げたプロジェクト
            </h2>
            <div className="grid gap-3">
              {userProjects.map((project) => (
                <Link href={`/project/${project.id}`} key={project.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition">
                  <div className="font-bold text-gray-800">{project.title}</div>
                  <div className="text-xs text-gray-500 mt-1">進捗: {project.progressStatus}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* スレッド一覧 */}
        {userThreads.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
              💬 作成したスレッド
            </h2>
            <div className="grid gap-3">
              {userThreads.map((thread) => (
                <Link href={`/thread/${thread.id}`} key={thread.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition">
                  <div className="font-bold text-gray-800">{thread.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(thread.createdAt).toLocaleDateString()}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}