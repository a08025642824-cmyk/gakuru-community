"use client";

import { useState, useEffect } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthButtonsWithAgreement({ variant = "content" }: { variant?: "header" | "content" }) {
  // 1. 規約同意のステータス
  const [agreed, setAgreed] = useState(false);

  // 2. シークレットコードのステータス
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gakuru_beta_unlocked") === "true";
    }
    return false;
  });

  // 🌟 ここに好きな合言葉を設定
  const CORRECT_CODE = "hello_world";

  const isHeader = variant === "header";

  // 3. イースターエッグ (PCエンジニア向けF12コンソール)
  useEffect(() => {
    console.log("%cGAKURU COMMUNITY", "color: #2563eb; font-size: 32px; font-weight: 900;");
    console.log("%cソフトウェア領域の共創プラットフォームへようこそ。", "font-size: 14px; color: #64748b;");
    console.log(`%c[ 招待コード: ${CORRECT_CODE} ]`, "color: #eab308; font-size: 16px; font-weight: bold; margin-top: 8px;");
  }, []);

  // ロック解除処理
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretCode === CORRECT_CODE) {
      setIsUnlocked(true);
      setError(false);
      localStorage.setItem("gakuru_beta_unlocked", "true");
    } else {
      setError(true);
      setSecretCode("");
    }
  };

  // 規約チェック処理
  const handleAuthClick = (e: React.MouseEvent) => {
    if (!agreed) {
      e.preventDefault();
      alert("💡 ログインまたは登録を行う前に、利用規約とプライバシーポリシーへの同意チェックを入れてください。");
    }
  };

  // ▼ 状態A：ロック解除前（合言葉入力画面）
  if (!isUnlocked) {
    return (
      <form 
        onSubmit={handleUnlock} 
        className={`flex items-center gap-2 transition-all ${isHeader ? "flex-row origin-right scale-90 sm:scale-100" : "flex-col sm:flex-row"}`}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="招待コード"
            value={secretCode}
            onChange={(e) => {
              setSecretCode(e.target.value);
              setError(false);
            }}
            className={`bg-gray-100 text-gray-800 placeholder-gray-400 rounded-full outline-none border transition-colors ${
              error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
            } ${isHeader ? "w-24 sm:w-32 px-3 py-1.5 text-xs" : "w-full sm:w-48 px-4 py-2 text-sm"}`}
          />
        </div>
        <button
          type="submit"
          className={`font-bold text-white bg-slate-700 hover:bg-slate-600 rounded-full transition-all active:scale-95 whitespace-nowrap ${
            isHeader ? "text-xs px-3 py-1.5" : "text-sm px-5 py-2"
          }`}
        >
          {isHeader ? "解除 🗝️" : "ロック解除 🗝️"}
        </button>
      </form>
    );
  }

  // ▼ 状態B：ロック解除後（いつもの規約同意＆Clerkボタン）
  return (
    <div className={`flex animate-fade-in ${isHeader ? "flex-row items-center gap-2 sm:gap-3" : "flex-col items-end gap-2"}`}>
      
      {/* 🌟 ヘッダー用の表示（スマホでも絶対にリンクを隠さない） */}
      {isHeader && (
        <label className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-500 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3 sm:w-3.5 sm:h-3.5 cursor-pointer"
          />
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