import { auth } from "@clerk/nextjs/server";
import { db } from "../../../db/index";
import { threads, comments, users, criticalVotes } from "../../../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const threadId = resolvedParams.id;

  // 1. スレッド本体のデータを取得
  const threadData = await db
    .select({
      id: threads.id,
      authorId: threads.authorId, // 🌟 これを追加！
      title: threads.title,
      content: threads.content,
      createdAt: threads.createdAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      authorSkills: users.skills,
    })
    .from(threads)
    .leftJoin(users, eq(threads.authorId, users.id))
    .where(eq(threads.id, threadId))
    .limit(1);

  const thread = threadData[0];

  if (!thread) {
    return <div className="p-24 text-center">スレッドが見つかりません。</div>;
  }

  const threadSkills = Array.isArray(thread.authorSkills) ? thread.authorSkills : [];

  // 2. コメント一覧を取得
  const commentList = await db
    .select({
      id: comments.id,
      authorId: comments.authorId, // 🌟 これを追加！
      content: comments.content,
      createdAt: comments.createdAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      authorSkills: users.skills,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.threadId, threadId))
    .orderBy(desc(comments.createdAt));

  // 3. コメント送信処理
  async function submitComment(formData: FormData) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;

    const content = formData.get("content") as string;
    if (!content.trim()) return;

    await db.insert(comments).values({
      id: crypto.randomUUID(),
      threadId: threadId,
      authorId: userId,
      content: content,
      createdAt: new Date(),
    });

    revalidatePath(`/thread/${threadId}`);
  }

  // 🌟 1. クリティカルボタンの送信処理（Server Action）
  async function toggleCritical(formData: FormData) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;

    const commentId = formData.get("commentId") as string;

    // 既に投票済みかチェック（連打防止）
    const existing = await db
      .select()
      .from(criticalVotes)
      .where(
        and(
          eq(criticalVotes.commentId, commentId),
          eq(criticalVotes.userId, userId)
        )
      );
    if (existing.length === 0) {
      // 投票を記録
      await db.insert(criticalVotes).values({
        id: crypto.randomUUID(),
        userId: userId,
        commentId: commentId,
        createdAt: new Date(),
      });
      revalidatePath(`/thread/${threadId}`);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8 mt-10">
      <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block font-bold">
        ← トップに戻る
      </Link>

      {/* ▼ スレッド本体の表示 */}
      <div className="bg-white p-8 rounded-lg shadow-md border mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">{thread.title}</h1>
        <div className="flex items-center gap-3 mb-6 border-b pb-4 flex-wrap">

          {/* 🌟 アイコンと名前をリンク化 */}
          <Link href={`/user/${thread.authorId}`} className="flex items-center gap-2 hover:opacity-80 transition">
            {thread.authorAvatar ? (
              <img src={thread.authorAvatar} alt="avatar" className="w-10 h-10 rounded-full shadow-sm border" />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full shadow-sm border" />
            )}
            <span className="text-gray-800 font-bold hover:underline">{thread.authorName}</span>
          </Link>

          <div className="flex gap-1 ml-2">
            {threadSkills.map((skill: string, index: number) => (
              <span key={index} className="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold px-2 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
          </div>

          <span className="text-sm text-gray-400 ml-auto">{new Date(thread.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{thread.content}</p>
      </div>

      {/* ▼ コメント一覧の表示 */}
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">コメント ({commentList.length}件)</h2>
        {commentList.map((comment) => {
          const commentSkills = Array.isArray(comment.authorSkills) ? comment.authorSkills : [];
          return (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2 flex-wrap">

                {/* 🌟 コメント者のアイコンと名前をリンク化 */}
                <Link href={`/user/${comment.authorId}`} className="flex items-center gap-2 hover:opacity-80 transition">
                  {comment.authorAvatar ? (
                    <img src={comment.authorAvatar} alt="avatar" className="w-6 h-6 rounded-full border shadow-sm" />
                  ) : (
                    <div className="w-6 h-6 bg-gray-200 rounded-full border shadow-sm" />
                  )}
                  <span className="text-sm font-bold text-gray-800 hover:underline">{comment.authorName}</span>
                </Link>
                {userId && (
                  <form action={toggleCritical}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <button
                      type="submit"
                      className="text-lg hover:scale-125 transition-transform"
                      title="クリティカル！"
                    >
                      💡
                    </button>
                  </form>
                )}

                <div className="flex gap-1 ml-1">
                  {commentSkills.map((skill: string, index: number) => (
                    <span key={index} className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>

                <span className="text-xs text-gray-400 ml-auto">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600">{comment.content}</p>
            </div>
          );
        })}
      </div>

      {/* ▼ コメント入力フォーム */}
      {userId ? (
        <form action={submitComment} className="bg-white p-6 rounded-lg shadow-sm border flex flex-col gap-4">
          <textarea
            name="content"
            required
            rows={3}
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="コメントを書き込む..."
          />
          <button type="submit" className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded transition self-end">
            送信する
          </button>
        </form>
      ) : (
        <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg border">
          コメントを書き込むにはログインしてください。
        </p>
      )}
    </main>
  );
}