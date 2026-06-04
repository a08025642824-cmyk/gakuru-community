"use client";

import { useRef, useState } from "react";
// 🌟 追加：共通の送信ボタンを読み込む（パスは適宜調整してください）
import SubmitButton from "../../components/SubmitButton";

export default function ChatForm({ sendMessage }: { sendMessage: (formData: FormData) => Promise<void> }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 1. 画像が「選択された瞬間」の処理（変更なし）
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert("⚠️ 画像のサイズが大きすぎます（上限1MBまで）。\nもう少し容量の小さい画像を選んでください。");
        removeImage();
        return;
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 2. プレビューの「✕ボタン」を押して取り消す処理（変更なし）
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  // 🌟 3. 変更：onSubmit ではなく「action属性」に渡す関数に書き換え！
  // FormData が直接渡ってくるので、e.preventDefault() は不要になります。
  const clientAction = async (formData: FormData) => {
    const file = formData.get("image") as File;

    // 念のためのサイズチェック
    if (file && file.size > 1 * 1024 * 1024) {
      alert("⚠️ 画像のサイズが大きすぎます（上限1MBまで）。");
      return;
    }

    // 親（page.tsx）から渡された送信関数（Server Action）を実行
    await sendMessage(formData);

    // 送信が終わったら、フォームの中身もプレビューも全部空っぽにリセット！
    formRef.current?.reset();
    setImagePreview(null);
  };

  return (
    // 🌟 変更：onSubmit={handleSubmit} を action={clientAction} に変更
    <form ref={formRef} action={clientAction} className="flex flex-col gap-2">
      
      {/* プレビュー表示エリア（変更なし） */}
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
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </label>

        <textarea
          name="content"
          rows={2}
          placeholder="メッセージを入力... (画像は1MBまで)"
          className="flex-1 border border-gray-300 p-3 text-sm rounded-lg focus:ring-2 focus:ring-black outline-none resize-none transition"
        />
        
        {/* 🌟 変更：通常の button から SubmitButton に差し替え */}
        {/* UIが崩れないように h-full などを className に引き継いでいます */}
        <SubmitButton 
          label="送信" 
          pendingLabel="送信中" 
          className="bg-black hover:bg-gray-800 text-white font-bold h-full py-3 px-6 rounded-lg transition whitespace-nowrap"
        />
      </div>
    </form>
  );
}