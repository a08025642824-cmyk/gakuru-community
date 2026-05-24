import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../db/index";
import { users, threads, projects, comments, criticalVotes } from "../db/schema";
import { desc, eq, gte } from "drizzle-orm";
import Link from "next/link";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, tab?: string }> }) {
  const { userId } = await auth();
  const user = await currentUser();

  const resolvedSearchParams = await searchParams;
  const currentCategory = resolvedSearchParams.category;
  const currentTab = resolvedSearchParams.tab || "threads";

  // 1. ユーザー情報の保存・更新
  if (user) {
    await db.insert(users).values({
      id: user.id,
      name: user.firstName || user.lastName || "名無しユーザー",
      username: user.username || `user_${user.id.slice(0, 8)}`,
      avatarUrl: user.imageUrl,
      createdAt: new Date(),
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        name: user.firstName || user.lastName || "名無しユーザー",
        avatarUrl: user.imageUrl,
      }
    });
  }

  // 2. データベースからデータを取得（選択されているタブに応じて切り替え）
  let threadList: any[] = [];
  let projectList: any[] = [];

  if (currentTab === "threads") {
    // ① スレッドの基本情報を取得
    const fetchedThreads = await db
      .select({
        id: threads.id,
        title: threads.title,
        content: threads.content,
        createdAt: threads.createdAt,
        categoryId: threads.categoryId,
        authorName: users.name,
        authorAvatar: users.avatarUrl,
        authorSkills: users.skills, 
      })
      .from(threads)
      .leftJoin(users, eq(threads.authorId, users.id))
      .where(currentCategory ? eq(threads.categoryId, currentCategory) : undefined);

    // 🌟 ② 過去3日間のデータを取得（トレンド計算用）
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const recentComments = await db
      .select()
      .from(comments)
      .where(gte(comments.createdAt, threeDaysAgo));

    const recentVotes = await db
      .select()
      .from(criticalVotes)
      .where(gte(criticalVotes.createdAt, threeDaysAgo));

    // 🌟 ③ 重みの設定（いつでもここでバランス調整できます）
    const WEIGHTS = {
      COMMENT: 1,      // 1コメント = 1点
      USER: 5,         // 1人参加 = 5点
      CRITICAL: 30,    // 1クリティカル = 30点（特大ボーナス）
    };

    // 🌟 ④ 各スレッドのトレンドスコアを計算
    threadList = fetchedThreads.map((thread) => {
      // このスレッドへの直近のコメントを抽出
      const threadComments = recentComments.filter((c) => c.threadId === thread.id);
      
      const commentCount = threadComments.length;
      const uniqueUsers = new Set(threadComments.map((c) => c.authorId)).size;
      
      const commentIds = threadComments.map((c) => c.id);
      const criticalCount = recentVotes.filter((v) => commentIds.includes(v.commentId)).length;

      // アルゴリズムでスコア算出
      const trendScore = (commentCount * WEIGHTS.COMMENT) + (uniqueUsers * WEIGHTS.USER) + (criticalCount * WEIGHTS.CRITICAL);

      return {
        ...thread,
        trendScore, // 計算結果を一時的に持たせる（画面には出さない）
      };
    });

    // 🌟 ⑤ トレンドスコアが高い順（同点なら新しい順）に並び替え
    threadList.sort((a, b) => {
      if (b.trendScore !== a.trendScore) {
        return b.trendScore - a.trendScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  } else if (currentTab === "projects") {
    // ① プロジェクト一覧を取得
    const fetchedProjects = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        progressStatus: projects.progressStatus,
        recruitingRoles: projects.recruitingRoles,
        isOpenToAll: projects.isOpenToAll,
        createdAt: projects.createdAt,
        ownerName: users.name,
        ownerAvatar: users.avatarUrl,
      })
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id));

    // 🌟 ② プロジェクトは「募集ステータス優先 ＋ 新着順」で並び替え
    const getStatusScore = (status: string) => {
      if (status === "メンバー募集中") return 100; // 最優先で一番上に！
      if (status === "企画中") return 80;
      if (status === "開発中") return 60;
      if (status === "テスト中") return 40;
      if (status === "リリース済み") return 20;
      return 0; // 停止中など
    };

    projectList = fetchedProjects.sort((a, b) => {
      const scoreA = getStatusScore(a.progressStatus);
      const scoreB = getStatusScore(b.progressStatus);
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // ステータスの点数が高い順
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  const getCategoryLabel = (id: string | null) => {
    if (id === "tech") return "💻 技術・プログラミング";
    if (id === "idea") return "💡 アイデア・企画";
    if (id === "chat") return "☕️ 雑談";
    return "未分類";
  };

  return (
    <main className="max-w-4xl mx-auto p-8 mt-4">
      
      {/* ▼ メインタブ切り替え（スレッド vs プロジェクト） */}
      <div className="flex gap-8 mb-8 border-b-2 border-gray-100">
        <Link 
          href="/?tab=threads" 
          className={`text-xl font-bold pb-3 transition ${
            currentTab === "threads" ? "text-black border-b-2 border-black -mb-[2px]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          💬 スレッド・雑談
        </Link>
        <Link 
          href="/?tab=projects" 
          className={`text-xl font-bold pb-3 transition ${
            currentTab === "projects" ? "text-black border-b-2 border-black -mb-[2px]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          🚀 プロジェクト募集
        </Link>
      </div>

      {/* =========================================
          タブが「スレッド」のときの表示
      ========================================= */}
      {currentTab === "threads" && (
        <>
          {/* カテゴリー絞り込みタブ */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <Link href="/?tab=threads" className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${!currentCategory ? "bg-black text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
              すべて
            </Link>
            <Link href="/?tab=threads&category=tech" className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${currentCategory === "tech" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
              💻 技術・プログラミング
            </Link>
            <Link href="/?tab=threads&category=idea" className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${currentCategory === "idea" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
              💡 アイデア・企画
            </Link>
            <Link href="/?tab=threads&category=chat" className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${currentCategory === "chat" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
              ☕️ 雑談
            </Link>
          </div>

          <div className="w-full space-y-4">
            {threadList.length === 0 ? (
              <p className="text-gray-500 text-center py-12 bg-white rounded-lg border">このカテゴリーにはまだスレッドがありません。</p>
            ) : (
              threadList.map((thread) => {
                const skillsArray = Array.isArray(thread.authorSkills) ? thread.authorSkills : [];
                return (
                  <Link href={`/thread/${thread.id}`} key={thread.id} className="block bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition relative">
                    <div className="absolute top-6 right-6 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                      {getCategoryLabel(thread.categoryId)}
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      {thread.authorAvatar ? <img src={thread.authorAvatar} alt="avatar" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 bg-gray-200 rounded-full" />}
                      <span className="text-sm font-medium text-gray-800">{thread.authorName}</span>
                      <div className="flex gap-1 flex-wrap">
                        {skillsArray.map((skill: string, index: number) => (
                          <span key={index} className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full">{skill}</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-auto">{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 pr-24">{thread.title}</h3>
                    <p className="text-gray-600 line-clamp-3">{thread.content}</p>
                  </Link>
                );
              })
            )}
          </div>
        </>
      )}

      {/* =========================================
          タブが「プロジェクト」のときの表示
      ========================================= */}
      {currentTab === "projects" && (
        <div className="w-full space-y-6">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">募集中のプロジェクト</h2>
            <Link href="/project/create" className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition">
              ＋ プロジェクトを立ち上げる
            </Link>
          </div>

          {projectList.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-white rounded-lg border">まだプロジェクトがありません。最初のプロジェクトを立ち上げましょう！</p>
          ) : (
            projectList.map((project) => {
              const rolesArray = Array.isArray(project.recruitingRoles) ? project.recruitingRoles : [];
              return (
                <Link href={`/project/${project.id}`} key={project.id} className="block bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {project.ownerAvatar ? <img src={project.ownerAvatar} alt="avatar" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 bg-gray-200 rounded-full" />}
                      <span className="text-sm font-medium text-gray-600">{project.ownerName}</span>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full w-fit">
                      {project.progressStatus}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{project.title}</h3>
                  <p className="text-gray-600 line-clamp-2 mb-6">{project.description}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-sm font-bold text-gray-700 whitespace-nowrap">募集ポジション：</div>
                    <div className="flex flex-wrap gap-2">
                      {rolesArray.map((role: string, index: number) => (
                        <span key={index} className="bg-white border border-gray-300 text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {role}
                        </span>
                      ))}
                      {project.isOpenToAll && (
                        <span className="bg-yellow-100 border border-yellow-200 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          🙌 分野問わず歓迎！
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

    </main>
  );
}