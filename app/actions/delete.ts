"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../db/index";
import { comments, projectMessages } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 💬 スレッドのコメント削除
export async function deleteThreadComment(commentId: string, threadId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "未ログインです" };

  try {
    // 🌟 「指定のコメントID」かつ「作成者が自分」の場合のみ削除する（他人の削除を防止）
    await db
      .delete(comments)
      .where(
        and(
          eq(comments.id, commentId),
          eq(comments.authorId, userId)
        )
      );

    // 画面を最新状態に更新（パスは実際のURL構造に合わせてください）
    revalidatePath(`/`);
    revalidatePath(`/thread/${threadId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return { success: false, error: "コメントの削除に失敗しました" };
  }
}

// 🚀 プロジェクトチャットの削除
export async function deleteProjectMessage(messageId: string, projectId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "未ログインです" };

  try {
    await db
      .delete(projectMessages)
      .where(
        and(
          eq(projectMessages.id, messageId),
          eq(projectMessages.authorId, userId)
        )
      );

    revalidatePath(`/project/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete Message Error:", error);
    return { success: false, error: "メッセージの削除に失敗しました" };
  }
}