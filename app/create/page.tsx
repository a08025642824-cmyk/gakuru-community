import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "../../db";
import { threads } from "../../db/schema";
// 🌟 追加：ダブルタップ防止用のボタンを読み込む
import SubmitButton from "../components/SubmitButton";

export default async function CreateThreadPage() {
  // 1. ログインチェック（ログインしてない人はトップページに弾く）
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  // 2. フォーム送信ボタンが押された時の処理（Server Action）
  async function submitThread(formData: FormData) {
    "use server"; 

    // 再度ログイン確認
    const { userId } = await auth();
    if (!userId) return;

    // フォームに入力されたデータを受け取る
    const title = formData.get("title") as string;
    const categoryId = formData.get("category") as string;
    const content = formData.get("content") as string;

    // データベース（threadsテーブル）に書き込む
    await db.insert(threads).values({
      id: crypto.randomUUID(), 
      authorId: userId,
      categoryId: categoryId,
      title: title,
      content: content,
      createdAt: new Date(),
    });

    // 書き込みが終わったらトップページに戻る
    redirect("/home");
  }

  return (
    <main className="max-w-2xl mx-auto p-8 mt-10 bg-white rounded-lg shadow-md border">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">新しいスレッドを立てる</h1>

      <form action={submitThread} className="space-y-6 flex flex-col">
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">タイトル</label>
          <input 
            type="text" 
            name="title" 
            required 
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-black transition" 
            placeholder="例：Next.jsの学習について"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">カテゴリー</label>
          <select name="category" className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-black transition bg-white">
            <option value="tech">技術・プログラミング</option>
            <option value="idea">アイデア・企画</option>
            <option value="chat">雑談</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">本文</label>
          <textarea 
            name="content" 
            required 
            rows={6} 
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="みんなと話したい内容を書いてください..."
          />
        </div>

        {/* 🌟 修正：通常の <button> を消去し、SubmitButton に差し替え */}
        <SubmitButton 
          label="スレッドを作成する"
          pendingLabel="スレッドを作成中..."
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-4 rounded transition flex items-center justify-center"
        />
      </form>
    </main>
  );
}