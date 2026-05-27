"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 開発時にエラー内容をログで確認できるようにしておく
    console.error("Captured Application Error:", error);
  }, [error]);

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0f172a] text-white px-4 py-16 selection:bg-blue-500/30">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* 500 視覚グラフィック (バグ・クラッシュ表現) */}
        <div className="relative flex justify-center">
          <svg
            className="w-48 h-48 text-slate-700"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* エラーの背景エフェクト */}
            <circle cx="100" cy="110" r="50" fill="#ef4444" fillOpacity="0.05" />
            
            {/* 大きな「G」のシルエット */}
            <path
              d="M140 65 C125 50 105 45 85 50 C55 58 35 88 35 120 C35 155 65 180 100 180 C135 180 160 155 160 120 L160 110 L100 110"
              stroke="#334155"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* ショートして火花が出ている電球 */}
            <circle cx="100" cy="95" r="20" stroke="#ef4444" strokeWidth="6" fill="#1e293b" />
            <path d="M90 115 L110 115 M93 121 L107 121" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            
            {/* 警告マーク (!) */}
            <path d="M100 85 L100 95 M100 103 L100 105" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />

            {/* クラッシュの火花線 */}
            <path d="M72 72 L64 64 M128 72 L136 64 M65 100 L55 100 M135 100 L145 100" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          </svg>

          {/* 500 ERROR のバッジ */}
          <div className="absolute top-4 right-10 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-md shadow-lg transform -rotate-6 select-none animate-bounce">
            500: System Error
          </div>
        </div>

        {/* テキストエリア */}
        <div className="space-y-3">
          <p className="text-xs font-bold tracking-widest text-red-400 uppercase">
            Gakuru Community
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-100">
            システムエラーが発生しました
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-sm mx-auto mt-4">
            一時的にコードのコンパイル、またはデータベースとの同期に問題が発生したようです。もう一度処理を試みるか、ホームに戻ってみてください。
          </p>
          {error.digest && (
            <p className="text-[10px] text-slate-600 font-mono mt-2">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        {/* アクションボタンエリア（2つの選択肢） */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-full text-sm shadow-md shadow-blue-600/10 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            🔄 もう一度試す
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-3 rounded-full text-sm border border-slate-700 transition-all duration-200 active:scale-95"
          >
            ホームへ戻る
          </Link>
        </div>
        
      </div>
    </main>
  );
}