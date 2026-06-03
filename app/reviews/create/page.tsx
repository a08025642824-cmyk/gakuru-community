"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createReviewRequest } from "../../actions/reviews"; // 🌟 先ほど作ったServer Actionのパスに合わせてください

export default function CreateReviewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    // Server Actionを呼び出してデータベースに保存
    const res = await createReviewRequest(formData);

    if (res.success) {
      // 成功したら一覧画面（レビューボード）に遷移する
      router.push("/reviews");
    } else {
      setError(res.error || "エラーが発生しました");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-8 mt-10 animate-fade-in">
      {/* 🌟 修正： href="/reviews" を href="/home?tab=reviews" に変更 */}
      <Link href="/home?tab=reviews" className="text-blue-500 hover:underline mb-6 inline-block font-bold">
        ← レビューボードに戻る
      </Link>

      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-black text-gray-800 mb-2">🚀 アプリを投稿する</h1>
        <p className="text-sm text-gray-500 mb-8 pb-6 border-b">
          開発中のアプリやポートフォリオを公開して、コミュニティからフィードバックをもらいましょう！
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* プロダクト名 */}
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
              プロダクト名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="例: Gakuru Community"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
            />
          </div>

          {/* URL */}
          <div>
            <label htmlFor="targetUrl" className="block text-sm font-bold text-gray-700 mb-2">
              公開URL（あれば）
            </label>
            <input
              type="url"
              id="targetUrl"
              name="targetUrl"
              placeholder="https://..."
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition text-sm"
            />
            <p className="text-[10px] text-gray-400 mt-1">VercelのプレビューURLや、GitHub PagesのURLでもOKです。</p>
          </div>

          {/* 概要と欲しいフィードバック */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
              概要と欲しいフィードバック <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              placeholder="・どんな課題を解決するアプリか&#13;&#10;・どの部分（デザイン、コード、アイデア）をレビューしてほしいか&#13;&#10;など、具体的に書くと回答がもらいやすくなります！"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black outline-none transition resize-none text-sm leading-relaxed"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? "投稿中..." : "🚀 レビューを募集する"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}