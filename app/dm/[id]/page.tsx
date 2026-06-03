import { auth } from "@clerk/nextjs/server";
import { db } from "../../../db/index";
import { directMessages, users } from "../../../db/schema";
import { eq, or, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob"; // 🌟 Vercel Blobをインポート
import ChatForm from "./ChatForm";

export default async function DMChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId: myId } = await auth();
  
  if (!myId) {
    redirect("/home");
  }

  const resolvedParams = await params;
  const targetUserId = resolvedParams.id;

  // 🌟 安全装置（これはここに残しておいて正解です！）
  if (!targetUserId || targetUserId === "undefined") {
    return <div className="p-24 text-center text-gray-500">無効なユーザーIDです。</div>;
  }

  if (myId === targetUserId) {
    redirect("/mypage");
  }

  const targetUserData = await db
    .select()
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  const targetUser = targetUserData[0];

  if (!targetUser) {
    return <div className="p-24 text-center">ユーザーが見つかりません。</div>;
  }

  // 👇 （間違って混ざっていた conversationsMap などの処理を削除しました）👇

  // ２人の間のメッセージ履歴を取得
  const messagesList = await db
    .select()
    .from(directMessages)
    .where(
      or(
        and(eq(directMessages.senderId, myId), eq(directMessages.receiverId, targetUserId)),
        and(eq(directMessages.senderId, targetUserId), eq(directMessages.receiverId, myId))
      )
    )
    .orderBy(asc(directMessages.createdAt));

  // 🌟 画像にも対応したメッセージ送信処理
  async function sendMessage(formData: FormData) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;

    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File; 

    // テキストも画像もない場合は何もしない
    if (!content.trim() && (!imageFile || imageFile.size === 0)) return;

    let imageUrl = null;

    // 画像が選択されていれば、Vercel Blobにアップロード
    if (imageFile && imageFile.size > 0) {
      const blob = await put(imageFile.name, imageFile, {
        access: "public",
      });
      imageUrl = blob.url; 
    }

    await db.insert(directMessages).values({
      id: crypto.randomUUID(),
      senderId: userId,
      receiverId: targetUserId,
      content: content,
      imageUrl: imageUrl, 
      createdAt: new Date(),
    });

    revalidatePath(`/dm/${targetUserId}`);
  }

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8 h-[calc(100vh-64px)] flex flex-col">
      
      {/* ヘッダー部分 */}
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
      </div>

      {/* チャット履歴エリア */}
      <div className="flex-1 bg-gray-50 border-x overflow-y-auto p-6 space-y-6">
        {messagesList.length === 0 ? (
          <div className="text-center text-gray-400 py-12 flex flex-col items-center gap-2">
            <span className="text-4xl">👋</span>
            <p className="text-sm">まだメッセージはありません。</p>
          </div>
        ) : (
          messagesList.map((msg) => {
            const isMe = msg.senderId === myId;

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                  
                  {/* 画像があれば表示 */}
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="添付画像" 
                      className="max-w-full h-auto rounded-lg border shadow-sm mb-1 max-h-64 object-cover" 
                    />
                  )}

                  {/* テキストがあれば表示 */}
                  {msg.content.trim() && (
                    <div 
                      className={`p-3 text-sm whitespace-pre-wrap shadow-sm ${
                        isMe 
                          ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" 
                          : "bg-white border text-gray-800 rounded-2xl rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                  
                  <div className="text-[10px] text-gray-400 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* メッセージ入力エリア（画像添付ボタンを追加） */}
      {/* ▼ 変更後：メッセージ入力エリア */}
      <div className="bg-white border rounded-b-lg p-4 shadow-sm z-10">
        {/* 🌟 さっき作ったChatFormコンポーネントを呼び出すだけ！ */}
        <ChatForm sendMessage={sendMessage} />
      </div>

    </main>
  );
}