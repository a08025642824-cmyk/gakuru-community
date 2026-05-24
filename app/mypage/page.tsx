import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "../../db/index";
import { threads, users } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function MyPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const clerkUser = await currentUser();

  // 1. データベースから自分の情報（skillsとbio）を取得
  const userData = await db
    .select({
      skills: users.skills,
      bio: users.bio,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const myProfile = userData[0] || {};

  // skillsはJSON（配列）として保存されている想定なので、配列として扱う
  const skillsArray = Array.isArray(myProfile.skills) ? myProfile.skills : [];

  // 2. プロフィールを更新する処理（Server Action）
  async function updateProfile(formData: FormData) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;

    const skillsInput = formData.get("skills") as string;
    const bio = formData.get("bio") as string;

    // カンマ区切りの文字列を、空白を消して配列に変換（空文字は除外）
    const newSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    // データベースを更新
    await db.update(users)
      .set({
        skills: newSkills,
        bio: bio
      })
      .where(eq(users.id, userId));

    revalidatePath("/mypage");
  }

  // 3. 自分が立てたスレッド一覧を取得
  const myThreads = await db
    .select({
      id: threads.id,
      title: threads.title,
      content: threads.content,
      createdAt: threads.createdAt,
    })
    .from(threads)
    .where(eq(threads.authorId, userId))
    .orderBy(desc(threads.createdAt));

  return (
    <main className="max-w-3xl mx-auto p-8 mt-4">

      {/* ▼ プロフィール表示エリア */}
      <div className="bg-white p-8 rounded-lg shadow-sm border mb-8 flex flex-col md:flex-row gap-6 items-start">
        {clerkUser?.imageUrl ? (
          <img src={clerkUser.imageUrl} alt="Profile" className="w-24 h-24 rounded-full shadow-sm" />
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded-full shadow-sm" />
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 flex flex-wrap items-center gap-3 mb-2">
            {clerkUser?.firstName || clerkUser?.lastName || "名無しユーザー"}

            {/* 🌟 配列になったスキルを複数バッジとして表示 */}
            {skillsArray.map((skill: string, index: number) => (
              <span key={index} className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </h1>

          <p className="text-gray-600 mt-3 whitespace-pre-wrap leading-relaxed">
            {myProfile.bio ? myProfile.bio : "自己紹介はまだありません。"}
          </p>
          <p className="text-gray-400 mt-4 text-sm font-medium">作成したスレッド: {myThreads.length}件</p>
        </div>
      </div>

      {/* ▼ プロフィール編集フォーム */}
      <div className="bg-white p-8 rounded-lg shadow-sm border mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">プロフィールを編集</h2>

        <form action={updateProfile} className="space-y-4">
          <div>
            {/* 🌟 ラベルの文字を変更 */}
            <label className="block text-sm font-bold mb-2 text-gray-700">
              活動領域・肩書き（複数ある場合はカンマ「,」で区切る）
            </label>
            <input
              type="text"
              name="skills"
              defaultValue={skillsArray.join(", ")}
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：Webエンジニア, 動画編集, マーケティング,アプリエンジニア,AI研修者,デザイナー"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">自己紹介</label>
            <textarea
              name="bio"
              defaultValue={myProfile.bio || ""}
              rows={3}
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="興味のある分野や、一緒にやりたいことなどを書いてみましょう！"
            />
          </div>
          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded transition"
          >
            保存する
          </button>
        </form>
      </div>

      {/* ▼ 自分のスレッド一覧 */}
      <div className="w-full space-y-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">自分のスレッド</h2>

        {myThreads.length === 0 ? (
          <p className="text-gray-500 text-center py-12 bg-white rounded-lg border">
            まだスレッドを立てていません。
          </p>
        ) : (
          myThreads.map((thread) => (
            <Link
              href={`/thread/${thread.id}`}
              key={thread.id}
              className="block bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{thread.title}</h3>
              <p className="text-gray-600 line-clamp-2 mb-3">{thread.content}</p>
              <div className="text-sm text-gray-400 text-right">
                {new Date(thread.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))
        )}
      </div>

    </main>
  );
}