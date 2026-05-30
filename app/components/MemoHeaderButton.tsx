"use client";

import { useState } from "react";
import PrivateMemoDrawer from "./PrivateMemoDrawer"; // 先ほど作ったドロワーのファイルパス

export default function MemoHeaderButton() {
  const [isMemoOpen, setIsMemoOpen] = useState(false);

  return (
    <>
      {/* 🌟 ヘッダーに表示されるボタン */}
      <button 
        onClick={() => setIsMemoOpen(true)}
        className="relative text-xl sm:text-sm font-bold text-gray-600 hover:text-black transition cursor-pointer"
        title="セカンドブレイン (AIメモ)"
      >
        🧠<span className="hidden sm:inline"> メモ</span>
      </button>

      {/* 🌟 画面右から出てくるドロワー本体 */}
      <PrivateMemoDrawer isOpen={isMemoOpen} onClose={() => setIsMemoOpen(false)} />
    </>
  );
}