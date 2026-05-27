import { auth } from "@clerk/nextjs/server";
import { db } from "../../db/index";
import { notifications, threads, comments, users } from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function NotificationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // 1. 通知一覧を取得（新着順）
  const notificationList = await db
    .select({
      id: notifications.id,
      threadId: notifications.threadId,
      type: notifications.type,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      senderName: users.name,
      threadTitle: threads.title,
    })
    .from(notifications)
    .leftJoin(users, eq(notifications.senderId, users.id))
    .leftJoin(threads, eq(notifications.threadId, threads.id))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  // 2. 通知をクリックした時の処理（既読にしてスレッドへ飛ぶ）
  async function markAsRead(notificationId: string, threadId: string | null) {
    "use server";
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
    
    revalidatePath("/notifications");
    redirect(`/thread/${threadId}`);
  }

  return (
    <main className="max-w-2xl mx-auto p-8 mt-10">
      <h1 className="text-2xl font-bold mb-6">🔔 通知センター</h1>
      
      <div className="space-y-4">
        {notificationList.length === 0 ? (
          <p className="text-gray-500 text-center py-10">まだ通知はありません。</p>
        ) : (
          notificationList.map((n) => (
            <form action={() => markAsRead(n.id, n.threadId)} key={n.id}>
              <button 
                type="submit" 
                className={`w-full text-left p-4 rounded-lg border transition ${
                  n.isRead ? "bg-white text-gray-500" : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="font-bold text-sm mb-1">
                  {n.senderName} さんがあなたのコメントに反応しました！
                </div>
                <div className="text-xs text-gray-600 truncate">
                  スレッド: {n.threadTitle}
                </div>
              </button>
            </form>
          ))
        )}
      </div>
    </main>
  );
}