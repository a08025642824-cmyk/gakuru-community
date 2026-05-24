import { auth } from "@clerk/nextjs/server";
import { db } from "../../db/index";
import { directMessages, users } from "../../db/schema";
import { eq, or, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DMInboxPage() {
  const { userId: myId } = await auth();
  
  if (!myId) {
    redirect("/");
  }

  // 1. 自分が送った、または受け取った「すべてのメッセージ」を新しい順に取得
  const allMyMessages = await db
    .select()
    .from(directMessages)
    .where(
      or(
        eq(directMessages.senderId, myId),
        eq(directMessages.receiverId, myId)
      )
    )
    .orderBy(desc(directMessages.createdAt));

  // 2. 相手（パートナー）ごとに「最新のメッセージ」を1つだけ抜き出す処理
  const conversationsMap = new Map();
  for (const msg of allMyMessages) {
    // 自分が送信者なら相手はreceiver、自分が受信者なら相手はsender
    const partnerId = msg.senderId === myId ? msg.receiverId : msg.senderId;
    
    // まだMapに登録されていなければ（一番新しいメッセージなら）保存
    if (!conversationsMap.has(partnerId)) {
      conversationsMap.set(partnerId, msg);
    }
  }

  const partnerIds = Array.from(conversationsMap.keys());

  // 3. パートナーのユーザー情報を取得して、一覧（inbox）を作成
  let inbox: { user: any; latestMessage: any }[] = [];
  
  if (partnerIds.length > 0) {
    const partnersData = await db
      .select()
      .from(users)
      .where(inArray(users.id, partnerIds)); // inArrayを使って複数人を一気に検索！

    // ユーザー情報と最新メッセージを結合し、最新のメッセージが新しい順に並び替える
    inbox = partnersData.map(partner => ({
      user: partner,
      latestMessage: conversationsMap.get(partner.id)
    })).sort((a, b) => b.latestMessage.createdAt.getTime() - a.latestMessage.createdAt.getTime());
  }

  return (
    <main className="max-w-3xl mx-auto p-8 mt-4">
      <h1 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">
        ✉️ メッセージ
      </h1>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {inbox.length === 0 ? (
          <div className="text-center py-16 px-4">
            <span className="text-4xl mb-4 block">📮</span>
            <h2 className="text-lg font-bold text-gray-800 mb-2">まだメッセージはありません</h2>
            <p className="text-sm text-gray-500 mb-6">
              気になるプロジェクトやスレッドを見つけて、<br />メンバーにダイレクトメッセージを送ってみましょう！
            </p>
            <Link href="/?tab=projects" className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition">
              プロジェクトを探す
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {inbox.map(({ user, latestMessage }) => {
              const isMeSender = latestMessage.senderId === myId;
              
              return (
                <Link 
                  href={`/dm/${user.id}`} 
                  key={user.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
                >
                  {/* アバター画像 */}
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="w-12 h-12 rounded-full border shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full border shadow-sm flex-shrink-0" />
                  )}
                  
                  {/* ユーザー名と最新メッセージ */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-800 truncate pr-2">{user.name}</h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(latestMessage.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                      {/* 自分が送った最後のメッセージなら「自分: 」と付ける */}
                      {isMeSender && <span className="text-xs bg-gray-200 text-gray-600 px-1 rounded">自分</span>}
                      <span className="truncate">{latestMessage.content}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}