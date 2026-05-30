"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../db/index";
import { privateMemos } from "../../db/schema";
import { revalidatePath } from "next/cache";

export async function summarizeAndSaveMemo(rawText: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!rawText.trim()) return { success: false, error: "テキストが空です" };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            // 🌟 修正：バッククォートを1つにしました！
            content: `あなたは優秀な開発者の思考パートナーです。ユーザーの音声テキストを整理し、Markdown（### や ####、箇条書きなど）を用いて構造化して要約してください。
            また、そのメモの内容に最も適した短いラベル（例: アイデア, バグ, 日報, タスク, 技術メモ, その他 など、内容に応じて自由に決定）を1つ抽出してください。
            出力は必ず以下のJSONフォーマットを厳守してください。余計な文章は一切含めないでください。

            {
              "label": "抽出したカテゴリ名（1語）",
              "summary": "Markdown形式の要約文"
            }`
          },
          { role: "user", content: rawText }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("🚨 Groq API Error:", errorData);
      throw new Error("Groq APIの呼び出しに失敗しました");
    }

    const data = await response.json();
    const rawAiContent = data.choices[0].message.content;

    // 🌟 データの救出ロジック（防衛ライン）
    let label = "その他";
    let summary = "";

    try {
      const aiResult = JSON.parse(rawAiContent);
      label = aiResult.label || "その他";
      summary = aiResult.summary || aiResult.summary_text || aiResult.content || aiResult.text || "";
      
      if (!summary.trim()) {
        summary = rawAiContent; 
      }
    } catch (parseError) {
      console.warn("⚠️ AIの返答が有効なJSONではありませんでした。");
      summary = rawAiContent; 
    }

    // SQLiteへインサート
    await db.insert(privateMemos).values({
      id: crypto.randomUUID(),
      userId: userId,
      rawText: rawText,
      summary: summary,
      label: label,
      createdAt: new Date(),
    });

    revalidatePath("/brain");
    return { success: true, summary };

  } catch (err) {
    console.error("Groq Summary Error:", err);
    return { success: false, error: "要約・保存に失敗しました" };
  }
}