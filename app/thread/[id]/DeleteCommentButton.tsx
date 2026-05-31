"use client";

import { useState } from "react";
import { deleteThreadComment } from "../../actions/delete"; // 🌟 先ほど作ったServer Actionのパスに合わせて調整してください

export default function DeleteCommentButton({ 
  commentId, 
  threadId 
}: { 
  commentId: string; 
  threadId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // 誤操作防止の確認アラート
    if (!window.confirm("このコメントを削除してもよろしいですか？\n※この操作は取り消せません")) {
      return;
    }

    setIsDeleting(true);
    const res = await deleteThreadComment(commentId, threadId);
    
    if (!res.success) {
      alert(res.error || "削除に失敗しました");
      setIsDeleting(false);
    }
    // 成功した場合は Server Action 側の revalidatePath で自動的に画面が更新され、このボタンごと消えます
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition disabled:opacity-50 ml-3"
      title="コメントを削除"
    >
      {isDeleting ? "削除中..." : "🗑️"}
    </button>
  );
}