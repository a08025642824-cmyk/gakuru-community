"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../../db/index";
import { criticalVotes, comments, notifications } from "../../../db/schema"; // 🌟 notifications を追加
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitCriticalVote(commentId: string, threadId: string) {
  const { userId } = await auth();
  if (!userId) return;

  // 1. 既に投票済みかチェック
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
    // 2. 投票を記録
    await db.insert(criticalVotes).values({
      id: crypto.randomUUID(),
      userId: userId,
      commentId: commentId,
      createdAt: new Date(),
    });

    // 3. 🌟 通知を飛ばすための処理
    // まず、そのコメントの投稿者（authorId）を調べる
    const targetComment = await db
      .select({ authorId: comments.authorId })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    const commentAuthorId = targetComment[0]?.authorId;

    // 自分のコメントに対する投票でなければ、通知レコードを作成
    if (commentAuthorId && commentAuthorId !== userId) {
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: commentAuthorId, // 通知の宛先
        senderId: userId,        // 通知の送り主
        type: "critical",        // 💡 クリティカル評価
        threadId: threadId,      // リンク用
        commentId: commentId,
        isRead: false,           // 未読状態
        createdAt: new Date(),
      });
    }

    revalidatePath(`/thread/${threadId}`);
  }
}