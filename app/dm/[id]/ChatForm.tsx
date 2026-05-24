"use client";

import { useRef, useState } from "react";

export default function ChatForm({ sendMessage }: { sendMessage: (formData: FormData) => Promise<void> }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // inputタグを直接操作するための魔法の杖
  const [imagePreview, setImagePreview] = useState<string | null>(null); // 🌟 プレビュー用のURLを保存する箱

  // 🌟 1. 画像が「選択された瞬間」の処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // 1MB制限を「選んだ瞬間」にチェックして即座に弾く！
      if (file.size > 1 * 1024 * 1024) {
        alert("⚠️ 画像のサイズが大きすぎます（上限1MBまで）。\nもう少し容量の小さい画像を選んでください。");
        removeImage(); // プレビューと選択状態をリセット
        return;
      }
      
      // 問題なければ、ブラウザ上でだけ見える一時的なプレビューURLを作成
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 🌟 2. プレビューの「✕ボタン」を押して取り消す処理
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // 選んだファイル自体の記憶も消す
    }
  };

  // 3. 送信ボタンが押された時の処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;

    // 念のためのサイズチェック（そのまま残します）
    if (file && file.size > 1 * 1024 * 1024) {
      alert("⚠️ 画像のサイズが大きすぎます（上限1MBまで）。");
      return;
    }

    // 親（page.tsx）から渡された送信関数を実行
    await sendMessage(formData);

    // 送信が終わったら、フォームの中身もプレビューも全部空っぽにリセット！
    formRef.current?.reset();
    setImagePreview(null);
  };

  return (
    // 縦並び（プレビューが上、入力欄が下）になるように flex-col を追加
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2">
      
      {/* 🌟 プレビュー表示エリア（画像が選ばれている時だけ出現！） */}
      {imagePreview && (
        <div className="relative inline-block w-max ml-2 mt-2">
          <img 
            src={imagePreview} 
            alt="プレビュー" 
            className="h-24 w-auto rounded-lg border shadow-sm object-cover" 
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-black transition"
            title="画像を削除"
          >
            ✕
          </button>
        </div>
      )}

      {/* 入力欄とボタンのエリア */}
      <div className="flex gap-3 items-end">
        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-lg border transition h-full flex items-center justify-center" title="画像を添付 (1MBまで)">
          <span className="text-xl">📎</span>
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} // リセットできるように紐付け
            onChange={handleImageChange} // 🌟 画像が選ばれた瞬間に発動
          />
        </label>

        <textarea
          name="content"
          rows={2}
          placeholder="メッセージを入力... (画像は1MBまで)"
          className="flex-1 border border-gray-300 p-3 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
        
        <button 
          type="submit" 
          className="bg-black hover:bg-gray-800 text-white font-bold h-full py-3 px-6 rounded-lg transition"
        >
          送信
        </button>
      </div>
    </form>
  );
}