// app/actions/review.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../db/index";
import { reviewRequests, reviewFeedbacks } from "../../db/schema";
import { revalidatePath } from "next/cache";

// 🚀 1. レビュー募集を投稿する
export async function createReviewRequest(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "ログインが必要です" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const targetUrl = formData.get("targetUrl") as string;
  
  if (!title || !description) return { success: false, error: "必須項目が入力されていません" };

  try {
    const id = crypto.randomUUID();
    await db.insert(reviewRequests).values({
      id,
      authorId: userId,
      title,
      description,
      targetUrl,
      createdAt: new Date(),
    });

    revalidatePath("/reviews");
    return { success: true, id };
  } catch (error) {
    console.error("Create Review Request Error:", error);
    return { success: false, error: "投稿に失敗しました" };
  }
}

// 💬 2. 寄せられたアプリに対してフィードバック（コメント）を送る
export async function submitFeedback(requestId: string, type: 'good' | 'idea' | 'fix' | 'comment', content: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "ログインが必要です" };
  if (!content.trim()) return { success: false, error: "内容が空です" };

  try {
    await db.insert(reviewFeedbacks).values({
      id: crypto.randomUUID(),
      requestId,
      authorId: userId,
      type,
      content,
      createdAt: new Date(),
    });

    revalidatePath(`/reviews/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error("Submit Feedback Error:", error);
    return { success: false, error: "フィードバックの送信に失敗しました" };
  }
}