"use client";

import { useState } from "react";
import { submitFeedback } from "../../actions/reviews"; // 🌟 作成した Server Action にパスを合わせてください

export default function ReviewFeedbackForm({ requestId }: { requestId: string }) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<'good' | 'idea' | 'fix' | 'comment'>('good');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const res = await submitFeedback(requestId, type, content);
    
    if (res.success) {
      setContent(""); // 送信成功したら中身を空にする
    } else {
      alert(res.error || "エラーが発生しました");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">フィードバックを送る</h3>
      
      {/* フィードバックの「種類」を選ぶボタン */}
      <div className="flex flex-wrap gap-2 mb-4">
        <label className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition border select-none ${type === 'good' ? 'bg-red-50 border-red-200 text-red-600 shadow-sm' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
          <input type="radio" name="type" className="hidden" checked={type === 'good'} onChange={() => setType('good')} />
          🔥 ここが良い！
        </label>
        <label className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition border select-none ${type === 'idea' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 shadow-sm' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
          <input type="radio" name="type" className="hidden" checked={type === 'idea'} onChange={() => setType('idea')} />
          💡 改善アイデア
        </label>
        <label className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition border select-none ${type === 'fix' ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
          <input type="radio" name="type" className="hidden" checked={type === 'fix'} onChange={() => setType('fix')} />
          🐛 気になる点
        </label>
        <label className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition border select-none ${type === 'comment' ? 'bg-gray-800 border-gray-900 text-white shadow-sm' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
          <input type="radio" name="type" className="hidden" checked={type === 'comment'} onChange={() => setType('comment')} />
          💬 その他コメント
        </label>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="開発者のモチベーションが上がるような、建設的なフィードバックを書きましょう！"
        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black outline-none resize-none mb-3 text-sm leading-relaxed"
        rows={4}
        required
      />
      
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting || !content.trim()} className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-8 rounded-lg transition disabled:opacity-50 shadow-sm">
          {isSubmitting ? "送信中..." : "送信する"}
        </button>
      </div>
    </form>
  );
}