import { auth } from "@clerk/nextjs/server";
import { db } from "../../../db/index";
import { reviewRequests, reviewFeedbacks, users } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import ReviewFeedbackForm from "./ReviewFeedbackForm"; // 🌟 Step 1で作ったフォームを読み込む

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const requestId = resolvedParams.id;

  // 1. プロダクト（アプリ）の基本情報を取得
  const requestData = await db
    .select({
      id: reviewRequests.id,
      title: reviewRequests.title,
      description: reviewRequests.description,
      targetUrl: reviewRequests.targetUrl,
      createdAt: reviewRequests.createdAt,
      authorId: reviewRequests.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(reviewRequests)
    .leftJoin(users, eq(reviewRequests.authorId, users.id))
    .where(eq(reviewRequests.id, requestId))
    .limit(1);

  const request = requestData[0];

  if (!request) {
    return <div className="p-24 text-center font-bold text-gray-500">お探しのレビュー募集は見つかりませんでした。</div>;
  }

  // 2. このアプリに寄せられたフィードバック一覧を取得
  const feedbacks = await db
    .select({
      id: reviewFeedbacks.id,
      type: reviewFeedbacks.type,
      content: reviewFeedbacks.content,
      createdAt: reviewFeedbacks.createdAt,
      authorId: reviewFeedbacks.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(reviewFeedbacks)
    .leftJoin(users, eq(reviewFeedbacks.authorId, users.id))
    .where(eq(reviewFeedbacks.requestId, requestId))
    .orderBy(desc(reviewFeedbacks.createdAt));

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-8 mt-4 animate-fade-in">
      <Link href="/?tab=reviews" className="text-blue-500 hover:underline mb-6 inline-block font-bold">
        ← レビューボードに戻る
      </Link>

      {/* ▼ プロダクト詳細カード */}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border mb-10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          {request.authorAvatar ? (
            <img src={request.authorAvatar} alt="avatar" className="w-10 h-10 rounded-full border shadow-sm" />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full border shadow-sm" />
          )}
          <div>
            <div className="text-xs text-gray-500">開発者</div>
            <Link href={`/user/${request.authorId}`} className="font-bold text-gray-800 hover:underline">{request.authorName}</Link>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{new Date(request.createdAt).toLocaleDateString()}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-4">{request.title}</h1>
        
        {request.targetUrl && (
          <a href={request.targetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-mono text-sm px-4 py-2 rounded-lg transition mb-6 border border-blue-100">
            <span>🔗</span> {request.targetUrl} <span className="text-[10px]">↗</span>
          </a>
        )}

        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-xs font-bold text-gray-400 mb-2">概要と欲しいフィードバック</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{request.description}</p>
        </div>
      </div>

      {/* ▼ フィードバック入力フォーム（ログインしている人だけ表示） */}
      {userId ? (
        <ReviewFeedbackForm requestId={requestId} />
      ) : (
        <div className="bg-gray-50 border p-6 rounded-xl text-center mb-8">
          <p className="text-sm font-bold text-gray-500">フィードバックを送るにはログインしてください。</p>
        </div>
      )}

      {/* ▼ 寄せられたフィードバック一覧 */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          寄せられたフィードバック ({feedbacks.length}件)
        </h2>
        
        {feedbacks.length === 0 ? (
          <p className="text-gray-500 text-center py-12 bg-white rounded-lg border border-dashed">
            まだフィードバックがありません。一番乗りでコメントしてみましょう！
          </p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb) => {
              // 種類によって見た目（色やアイコン）を変える魔法
              const isGood = fb.type === 'good';
              const isIdea = fb.type === 'idea';
              const isFix = fb.type === 'fix';
              
              const bgColor = isGood ? 'bg-red-50' : isIdea ? 'bg-yellow-50' : isFix ? 'bg-blue-50' : 'bg-white';
              const borderColor = isGood ? 'border-red-200' : isIdea ? 'border-yellow-200' : isFix ? 'border-blue-200' : 'border-gray-200';
              const icon = isGood ? '🔥' : isIdea ? '💡' : isFix ? '🐛' : '💬';
              const label = isGood ? 'ここが良い！' : isIdea ? '改善アイデア' : isFix ? '気になる点' : 'コメント';

              return (
                <div key={fb.id} className={`${bgColor} ${borderColor} border p-5 rounded-xl shadow-sm`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-white/80 px-2 py-1 rounded text-xs font-bold shadow-sm border flex items-center gap-1">
                      <span>{icon}</span> {label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-4">{fb.content}</p>
                  
                  <div className="flex items-center justify-end gap-2 border-t border-black/5 pt-3">
                    {fb.authorAvatar ? (
                      <img src={fb.authorAvatar} alt="avatar" className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 bg-gray-200 rounded-full" />
                    )}
                    <span className="text-xs font-bold text-gray-600">{fb.authorName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </main>
  );
}