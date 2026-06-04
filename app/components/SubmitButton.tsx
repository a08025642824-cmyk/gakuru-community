"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label?: string;
  pendingLabel?: string;
  className?: string;
}

export default function SubmitButton({ 
  label = "送信する", 
  pendingLabel = "送信中...", 
  className = "" 
}: SubmitButtonProps) {
  // 🌟 現在フォームが送信中（pending）かどうかを自動で取得する
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending} // 🌟 送信中ならボタンを無効化（押せなくする）
      className={`${className} ${pending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          {/* 送信中用のくるくる回るアイコン（ローダー） */}
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}