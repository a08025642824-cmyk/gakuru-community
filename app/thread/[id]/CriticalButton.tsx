"use client";

import { useState, useTransition } from "react";
import { submitCriticalVote } from "./actions";

// ここに auth は不要です！
export default function CriticalButton({ 
  commentId, 
  hasVoted, 
  threadId 
}: { 
  commentId: string; 
  hasVoted: boolean; 
  threadId: string;
}) {
  const [voted, setVoted] = useState(hasVoted);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (voted) return;

    startTransition(async () => {
      setVoted(true);
      alert("💡 このコメントにクリティカル評価を送りました！");
      
      // ここでサーバーアクションを呼び出す（これが正しい流れ）
      await submitCriticalVote(commentId, threadId);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={voted || isPending}
      className={`text-lg transition-transform ${voted ? "opacity-100 grayscale-0" : "opacity-50 hover:opacity-100 hover:scale-125"}`}
      title="クリティカル！"
    >
      {voted ? "🌟" : "💡"}
    </button>
  );
}