"use client";

import { useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthButtonsWithAgreement({ variant = "content" }: { variant?: "header" | "content" }) {
  const [agreed, setAgreed] = useState(false);

  const handleAuthClick = (e: React.MouseEvent) => {
    if (!agreed) {
      e.preventDefault();
      alert("💡 ログインまたは登録を行う前に、利用規約とプライバシーポリシーへの同意チェックを入れてください。");
    }
  };

  const isHeader = variant === "header";

  return (
    <div className={`flex ${isHeader ? "flex-row items-center gap-2 sm:gap-3" : "flex-col items-end gap-2"}`}>
      
      {/* 🌟 ヘッダー用の表示（スマホでも絶対にリンクを隠さない） */}
      {isHeader && (
        <label className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-500 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3 sm:w-3.5 sm:h-3.5 cursor-pointer"
          />
          {/* 文字を少し短縮しつつ、改行させない(whitespace-nowrap)ことでスマホ幅に対応 */}
          <span className="whitespace-nowrap">
            <Link href="/terms" className="text-blue-500 hover:underline" target="_blank">規約</Link>
            と
            <Link href="/privacy" className="text-blue-500 hover:underline" target="_blank">ポリシー</Link>
            に同意
          </span>
        </label>
      )}

      {/* ボタンエリア */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <SignInButton mode="modal">
          <button 
            onClick={handleAuthClick}
            className={`text-xs sm:text-sm font-bold transition ${
              agreed ? "text-gray-600 hover:text-black cursor-pointer" : "text-gray-300 cursor-not-allowed"
            }`}
          >
            ログイン
          </button>
        </SignInButton>
        
        <SignUpButton mode="modal">
          <button 
            onClick={handleAuthClick}
            className={`text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 rounded-full shadow-sm transition whitespace-nowrap ${
              agreed 
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            登録
          </button>
        </SignUpButton>
      </div>

      {/* 🌟 メイン画面（コンテンツ）用の表示 */}
      {!isHeader && (
        <label className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 cursor-pointer select-none mr-1">
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
          />
          <span>
            <Link href="/terms" className="text-blue-500 hover:underline" target="_blank">利用規約</Link>
            と
            <Link href="/privacy" className="text-blue-500 hover:underline" target="_blank">プライバシーポリシー</Link>
            に同意する
          </span>
        </label>
      )}
    </div>
  );
}