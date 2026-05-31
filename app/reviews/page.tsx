// app/reviews/page.tsx
export const dynamic = 'force-dynamic';

import { db } from "../../db/index";
import { reviewRequests, users, reviewFeedbacks } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function ReviewBoardPage() {
  // レビュー募集一覧と、それぞれの投稿者の情報を取得
  const requests = await db
    .select({
      id: reviewRequests.id,
      title: reviewRequests.title,
      description: reviewRequests.description,
      targetUrl: reviewRequests.targetUrl,
      createdAt: reviewRequests.createdAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(reviewRequests)
    .leftJoin(users, eq(reviewRequests.authorId, users.id))
    .orderBy(desc(reviewRequests.createdAt));

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-8 mt-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b pb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-800 flex items-center gap-2">
            🎯 プロダクト・レビュー
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            開発したWebサイトやアプリをシェアして、みんなからフィードバックをもらいましょう。
          </p>
        </div>
        
        {/* 新規投稿画面へのリンク */}
        <Link href="/reviews/create" className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg text-sm transition text-center shadow-sm whitespace-nowrap">
          ＋ アプリを投稿する
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => (
          <Link key={req.id} href={`/reviews/${req.id}`} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col h-full group">
            
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition mb-2 line-clamp-2">
                {req.title}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {req.description}
              </p>
            </div>

            {/* URLがある場合はリンク風バッジを表示 */}
            {req.targetUrl && (
              <div className="mb-4 text-[10px] text-blue-500 font-mono bg-blue-50 px-2 py-1 rounded truncate">
                🔗 {req.targetUrl}
              </div>
            )}

            <div className="border-t pt-4 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                {req.authorAvatar ? (
                  <img src={req.authorAvatar} className="w-6 h-6 rounded-full border" alt="" />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-full border" />
                )}
                <span className="text-xs font-bold text-gray-700">{req.authorName}</span>
              </div>
              <span className="text-[10px] text-gray-400">
                {new Date(req.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}