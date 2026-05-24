import { auth } from "@clerk/nextjs/server";
import { db } from "../../../db/index";
import { directMessages, users } from "../../../db/schema";
import { eq, or, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DMChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId: myId } = await auth();
  
  // ログインしていない場合はトップへ
  if (!myId) {
    redirect("/");
  }

  const resolvedParams = await params;
  const targetUserId = resolvedParams.id;

  // 自分自身とのDMは防ぐ
  if (myId === targetUserId) {
    redirect("/mypage");
  }

  // 1. 相手のユーザー情報を取得
  const targetUserData = await db
    .select()
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  const targetUser = targetUserData[0];

  if (!targetUser) {
    return <div className="p-24 text-center">ユーザーが見つかりません。</div>;
  }

  // 2. 過去のメッセージ履歴を取得（自分→相手、または 相手→自分 の両方）
  const messagesList = await db
    .select()
    .from(directMessages)
    .where(
      or(
        and(eq(directMessages.senderId, myId), eq(directMessages.receiverId, targetUserId)),
        and(eq(directMessages.senderId, targetUserId), eq(directMessages.receiverId, myId))
      )
    )
    .orderBy(asc(directMessages.createdAt)); // 古い順に取得（上から下へ流れるように）

  // 3. メッセージ送信処理（Server Action）
  async function sendMessage(formData: FormData) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;

    const content = formData.get("content") as string;
    if (!content.trim()) return;

    await db.insert(directMessages).values({
      id: crypto.randomUUID(),
      senderId: userId,
      receiverId: targetUserId,
      content: content,
      createdAt: new Date(),
    });

    revalidatePath(`/dm/${targetUserId}`);
  }

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8 h-[calc(100vh-64px)] flex flex-col">
      
      {/* ▼ ヘッダー部分（相手の情報） */}
      <div className="bg-white border rounded-t-lg p-4 flex items-center gap-4 shadow-sm z-10">
        <Link href={`/user/${targetUserId}`} className="hover:opacity-80 transition flex-shrink-0">
          {targetUser.avatarUrl ? (
            <img src={targetUser.avatarUrl} alt="avatar" className="w-12 h-12 rounded-full shadow-sm border" />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full shadow-sm border" />
          )}
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-gray-800">{targetUser.name}</h1>
          <p className="text-xs text-gray-500">ダイレクトメッセージ</p>
        </div>
        <Link href={`/user/${targetUserId}`} className="text-sm font-bold text-gray-500 hover:text-black border px-3 py-1.5 rounded transition">
          プロフィールを見る
        </Link>
      </div>

      {/* ▼ チャット履歴エリア */}
      <div className="flex-1 bg-gray-50 border-x overflow-y-auto p-6 space-y-6">
        {messagesList.length === 0 ? (
          <div className="text-center text-gray-400 py-12 flex flex-col items-center gap-2">
            <span className="text-4xl">👋</span>
            <p className="text-sm">まだメッセージはありません。<br/>挨拶を送ってプロジェクトに誘ってみましょう！</p>
          </div>
        ) : (
          messagesList.map((msg) => {
            const isMe = msg.senderId === myId;

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                  
                  {/* 吹き出し */}
                  <div 
                    className={`p-3 text-sm whitespace-pre-wrap shadow-sm ${
                      isMe 
                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" 
                        : "bg-white border text-gray-800 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  
                  {/* 時間 */}
                  <div className="text-[10px] text-gray-400 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ▼ メッセージ入力エリア */}
      <div className="bg-white border rounded-b-lg p-4 shadow-sm z-10">
        <form action={sendMessage} className="flex gap-3 items-end">
          <textarea
            name="content"
            required
            rows={2}
            placeholder="メッセージを入力..."
            className="flex-1 border border-gray-300 p-3 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
          <button 
            type="submit" 
            className="bg-black hover:bg-gray-800 text-white font-bold h-full py-3 px-6 rounded-lg transition"
          >
            送信
          </button>
        </form>
      </div>

    </main>
  );
}