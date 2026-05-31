"use client";

import { useState } from "react";
import { deleteProjectMessage } from "../../actions/delete"; // 🌟 作成したServer Actionのパスに合わせて調整してください

export default function DeleteMessageButton({ 
  messageId, 
  projectId 
}: { 
  messageId: string; 
  projectId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("このメッセージを削除してもよろしいですか？")) {
      return;
    }

    setIsDeleting(true);
    const res = await deleteProjectMessage(messageId, projectId);
    
    if (!res.success) {
      alert(res.error || "削除に失敗しました");
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs text-gray-400 hover:text-red-500 transition disabled:opacity-50 ml-2"
      title="メッセージを削除"
    >
      {isDeleting ? "削除中..." : "🗑️"}
    </button>
  );
}