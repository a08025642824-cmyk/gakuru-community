// app/brain/page.tsx
export const dynamic = 'force-dynamic'; // 🌟 追加：常に最新のDBを見に行く命令

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "../../db/index";
import { privateMemos } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import MarkdownRenderer from "../components/MarkdownRenderer"; // 🌟 さっきの部品を呼び出す

export default async function SecondBrainPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const params = await searchParams;
  const viewMode = params.view || "date";

  // 🌟 DBから自分のメモを全件取得
  const myMemos = await db
    .select()
    .from(privateMemos)
    .where(eq(privateMemos.userId, userId))
    .orderBy(desc(privateMemos.createdAt));

  // 日付でグループ化
  const groupByDate = () => {
    const groups: { [key: string]: typeof myMemos } = {};
    myMemos.forEach((memo) => {
      const dateStr = new Date(memo.createdAt).toLocaleDateString("ja-JP", {
        year: "numeric", month: "2-digit", day: "2-digit"
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(memo);
    });
    return groups;
  };

  // ラベルでグループ化
  const groupByLabel = () => {
    const groups: { [key: string]: typeof myMemos } = {};
    myMemos.forEach((memo) => {
      const label = memo.label || "その他";
      if (!groups[label]) groups[label] = [];
      groups[label].push(memo);
    });
    return groups;
  };

  const datedGroups = groupByDate();
  const labeledGroups = groupByLabel();

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-8 mt-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-800 flex items-center gap-2">
          🧠 セカンドブレイン
        </h1>
        <Link href="/" className="text-sm font-bold text-gray-500 hover:text-black transition">
          ← 戻る
        </Link>
      </div>

      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        <Link href="/brain?view=date" className={`px-4 py-2 text-xs font-bold rounded-md transition ${viewMode === "date" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
          📅 日ごとで見る
        </Link>
        <Link href="/brain?view=label" className={`px-4 py-2 text-xs font-bold rounded-md transition ${viewMode === "label" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
          🏷️ ラベル別で見る
        </Link>
      </div>

      {myMemos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 font-bold">まだ記憶がありません。</p>
        </div>
      ) : (
        <div className="space-y-10">
          {viewMode === "date" && Object.keys(datedGroups).map((date) => (
            <div key={date} className="space-y-4">
              <h2 className="text-sm font-black text-gray-400 tracking-wider border-l-4 border-blue-500 pl-2 uppercase">{date}</h2>
              <div className="space-y-4">
                {datedGroups[date].map((memo) => (
                  <MemoCard key={memo.id} memo={memo} showLabelTag={true} />
                ))}
              </div>
            </div>
          ))}

          {viewMode === "label" && Object.keys(labeledGroups).map((label) => (
            <div key={label} className="space-y-4">
              <h2 className="text-sm font-black text-gray-700 bg-slate-200/60 px-3 py-1.5 rounded-md w-fit flex items-center gap-1.5">
                <span>📌</span> {label} <span className="text-xs text-gray-400 font-normal">({labeledGroups[label].length}件)</span>
              </h2>
              <div className="space-y-4">
                {labeledGroups[label].map((memo) => (
                  <MemoCard key={memo.id} memo={memo} showLabelTag={false} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

// 🗂️ メモカード用コンポーネント
function MemoCard({ memo, showLabelTag }: { memo: any; showLabelTag: boolean }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <span className="text-[10px] font-bold text-gray-400">
          {new Date(memo.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
        </span>
        {showLabelTag && (
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-100 shadow-sm">
            #{memo.label}
          </span>
        )}
      </div>

      {/* 🌟 ここで部品（MarkdownRenderer）に、DBのデータを渡して呼び出している！ */}
      <MarkdownRenderer content={memo.summary} />

      <details className="mt-4 group/details cursor-pointer border-t pt-3 border-gray-50">
        <summary className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 transition select-none outline-none">
          ▶ 音声の原本（Raw Text）を見る
        </summary>
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-500 font-mono leading-relaxed border border-gray-100 whitespace-pre-wrap">
          {memo.rawText}
        </div>
      </details>
    </div>
  );
}