import { auth } from "@clerk/nextjs/server";
import { db } from "../../../db/index";
import { projects, projectMembers, users, projectMessages } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { put } from "@vercel/blob"; // 🌟 追加：Vercel Blob
import ProjectChatForm from "./ProjectChatForm"; // 🌟 追加：先ほど作った高機能フォーム
import DeleteMessageButton from "./DeleteMessageButton"; // 🌟 追加：プロジェクトチャット用の削除ボタン

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const projectId = resolvedParams.id;

  // 1. プロジェクト本体
  const projectData = await db
    .select({
      id: projects.id,
      ownerId: projects.ownerId,
      title: projects.title,
      description: projects.description,
      progressStatus: projects.progressStatus,
      onboardingMemo: projects.onboardingMemo,
      recruitingRoles: projects.recruitingRoles,
      isOpenToAll: projects.isOpenToAll,
      githubUrl: projects.githubUrl,
      figmaUrl: projects.figmaUrl,
      discordUrl: projects.discordUrl,
      documentUrl: projects.documentUrl,
      createdAt: projects.createdAt,
      ownerName: users.name,
      ownerAvatar: users.avatarUrl,
    })
    .from(projects)
    .leftJoin(users, eq(projects.ownerId, users.id))
    .where(eq(projects.id, projectId))
    .limit(1);

  const project = projectData[0];
  if (!project) return <div className="p-24 text-center">プロジェクトが見つかりません。</div>;

  // 2. メンバー一覧
  const membersData = await db
    .select({
      id: projectMembers.id,
      roleText: projectMembers.roleText,
      userId: users.id,
      userName: users.name,
      userAvatar: users.avatarUrl,
      userSkills: users.skills,
    })
    .from(projectMembers)
    .leftJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, projectId))
    .orderBy(desc(projectMembers.createdAt));

  const isMember = membersData.some((member) => member.userId === userId);
  const rolesArray = Array.isArray(project.recruitingRoles) ? project.recruitingRoles : [];

  // 3. チャット履歴（🌟 画像URLを取得できるように追加）
  const chatMessages = await db
    .select({
      id: projectMessages.id,
      authorId: projectMessages.authorId,
      content: projectMessages.content,
      imageUrl: projectMessages.imageUrl, // 🌟 これを追加！
      createdAt: projectMessages.createdAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(projectMessages)
    .leftJoin(users, eq(projectMessages.authorId, users.id))
    .where(eq(projectMessages.projectId, projectId))
    .orderBy(desc(projectMessages.createdAt));

  // プロジェクト参加処理
  async function joinProject(formData: FormData) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    const roleText = formData.get("roleText") as string || "メンバー";
    await db.insert(projectMembers).values({
      id: crypto.randomUUID(),
      projectId: projectId,
      userId: userId,
      roleText: roleText,
      status: "approved",
      createdAt: new Date(),
    });
    revalidatePath(`/project/${projectId}`);
  }

  // 🌟 画像対応版のチャット送信処理
  async function sendMessage(formData: FormData) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File;

    // 🌟 テキストも画像もない場合は何もしない
    if (!content.trim() && (!imageFile || imageFile.size === 0)) return;

    let imageUrl = null;

    // 🌟 画像が選択されていればVercel Blobにアップロード
    if (imageFile && imageFile.size > 0) {
      const blob = await put(imageFile.name, imageFile, {
        access: "public",
      });
      imageUrl = blob.url;
    }

    await db.insert(projectMessages).values({
      id: crypto.randomUUID(),
      projectId: projectId,
      authorId: userId,
      content: content,
      imageUrl: imageUrl, // 🌟 画像URLを保存
      createdAt: new Date(),
    });
    revalidatePath(`/project/${projectId}`);
  }

  return (
    <main className="max-w-4xl mx-auto p-8 mt-4">
      <Link href="/?tab=projects" className="text-blue-500 hover:underline mb-6 inline-block font-bold">
        ← プロジェクト一覧に戻る
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">{project.progressStatus}</span>
              <span className="text-sm text-gray-400">設立: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            {userId === project.ownerId && (
              <div className="mb-4 flex justify-end">
                <Link 
                  href={`/project/${project.id}/edit`} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg text-sm border shadow-sm transition flex items-center gap-2"
                >
                  ✏️ プロジェクトを編集
                </Link>
              </div>
            )}
            
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{project.title}</h1>
            {/* 🌟 追加：Twitter (X) シェアボタン */}
            <div className="mb-8">
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 「${project.title}」のメンバーを募集中！\n\n${project.description.slice(0, 50)}...\n\nGakuru Communityで一緒に開発しませんか？\n#GakuruCommunity #個人開発`)}&url=${encodeURIComponent(`https://gakuru-community.vercel.app/project/${project.id}`)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-black hover:bg-gray-800 text-white text-sm font-bold py-2 px-5 rounded-full inline-flex items-center gap-2 transition shadow-sm"
              >
                <span className="text-lg leading-none">𝕏</span> ポストして仲間を集める
              </a>
            </div>
          
            
            <div className="mb-8 pb-6 border-b flex items-center">
              <Link href={`/user/${project.ownerId}`} className="flex items-center gap-3 hover:opacity-80 transition">
                {project.ownerAvatar ? <img src={project.ownerAvatar} alt="avatar" className="w-10 h-10 rounded-full border shadow-sm" /> : <div className="w-10 h-10 bg-gray-200 rounded-full border shadow-sm" />}
                <div>
                  <div className="text-xs text-gray-500">発起人・オーナー</div>
                  <div className="font-bold text-gray-800 hover:underline">{project.ownerName}</div>
                </div>
              </Link>
            </div>

            <h2 className="text-xl font-bold mb-3 text-gray-800">プロジェクトの概要</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-8">{project.description}</p>

            <h2 className="text-xl font-bold mb-3 text-gray-800">募集ポジション</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {rolesArray.map((role: string, index: number) => (
                <span key={index} className="bg-gray-100 border border-gray-300 text-gray-700 text-sm font-bold px-4 py-2 rounded-full">{role}</span>
              ))}
              {project.isOpenToAll && <span className="bg-yellow-100 border border-yellow-200 text-yellow-800 text-sm font-bold px-4 py-2 rounded-full">🙌 専門外でも大歓迎！</span>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">💬 プロジェクト・チャット</h2>
            
            {/* 🌟 メンバーの場合は高機能フォームを表示 */}
            {isMember ? (
              <div className="mb-6">
                <ProjectChatForm sendMessage={sendMessage} />
              </div>
            ) : (
              <div className="mb-6 bg-gray-50 p-4 rounded text-center text-sm text-gray-500 border">チャットに参加するにはメンバーになる必要があります。</div>
            )}
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {chatMessages.length === 0 ? <p className="text-gray-400 text-center py-4 text-sm">まだメッセージはありません。</p> : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Link href={`/user/${msg.authorId}`} className="hover:opacity-80 transition mt-1 flex-shrink-0">
                      {msg.authorAvatar ? <img src={msg.authorAvatar} alt="avatar" className="w-8 h-8 rounded-full border" /> : <div className="w-8 h-8 bg-gray-200 rounded-full border" />}
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/user/${msg.authorId}`} className="font-bold text-sm text-gray-800 hover:underline">{msg.authorName}</Link>
                        <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                        
                        {/* 🌟 3. ログインユーザーとメッセージの作者が一致した時だけゴミ箱ボタンを出す */}
                        {userId === msg.authorId && (
                          <DeleteMessageButton messageId={msg.id} projectId={projectId} />
                        )}
                      </div>
                      
                      {/* 🌟 画像があれば表示 */}
                      {msg.imageUrl && (
                        <img 
                          src={msg.imageUrl} 
                          alt="添付画像" 
                          className="max-w-full h-auto rounded-lg border shadow-sm mb-2 max-h-64 object-cover" 
                        />
                      )}
                      
                      {/* 🌟 テキストがあれば表示 */}
                      {msg.content && msg.content.trim() !== "" && (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* 右側のサイドバー部分は変更なし */}
        <div className="space-y-6">
          {isMember ? (
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center shadow-sm">
              <div className="text-3xl mb-2">🎉</div><h3 className="font-bold text-green-800">あなたはメンバーです！</h3>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
              <h3 className="font-bold text-gray-800 mb-4">このプロジェクトに参加する</h3>
              {userId ? (
                <form action={joinProject} className="space-y-3">
                  <input type="text" name="roleText" placeholder="希望の担当（例: バックエンド, 応援係）" className="w-full border border-gray-300 p-2 text-sm rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition">🚀 参加する！</button>
                </form>
              ) : (
                <p className="text-sm text-gray-500 text-center bg-gray-50 p-3 rounded border">参加するにはログインが必要です。</p>
              )}
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="font-bold mb-4 text-gray-800 border-b pb-2">メンバー ({membersData.length}名)</h2>
            <div className="space-y-3">
              {membersData.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                  <Link href={`/user/${member.userId}`} className="hover:opacity-80 transition flex-shrink-0">
                    {member.userAvatar ? <img src={member.userAvatar} alt="avatar" className="w-8 h-8 rounded-full border" /> : <div className="w-8 h-8 bg-gray-200 rounded-full border" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/user/${member.userId}`} className="font-bold text-xs text-gray-800 truncate block hover:underline">{member.userName}</Link>
                    <div className="text-[10px] text-blue-600 truncate">{member.roleText}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* メンバー専用ダッシュボード */}
          {isMember && (
            <div className="bg-gray-900 p-6 rounded-lg shadow-md text-white">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">🔒 開発ダッシュボード</h3>
              {project.onboardingMemo && (
                <div className="bg-gray-800 p-3 rounded mb-4 border border-gray-700">
                  <div className="text-[10px] text-gray-400 mb-1">📝 合流メモ</div>
                  <p className="text-xs text-gray-200 whitespace-pre-wrap">{project.onboardingMemo}</p>
                </div>
              )}
              <div className="space-y-2">
                {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded flex items-center justify-between"><span className="font-bold text-xs">🐙 GitHub</span><span className="text-[10px] text-gray-400">↗</span></a>}
                {project.discordUrl && <a href={project.discordUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-indigo-900 hover:bg-indigo-800 border border-indigo-700 p-2 rounded flex items-center justify-between"><span className="font-bold text-xs">💬 Discord</span><span className="text-[10px] text-gray-400">↗</span></a>}
                {project.figmaUrl && <a href={project.figmaUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-pink-900 hover:bg-pink-800 border border-pink-700 p-2 rounded flex items-center justify-between"><span className="font-bold text-xs">🎨 Figma</span><span className="text-[10px] text-gray-400">↗</span></a>}
                {project.documentUrl && <a href={project.documentUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 p-2 rounded flex items-center justify-between"><span className="font-bold text-xs">📄 ドキュメント</span><span className="text-[10px] text-gray-400">↗</span></a>}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}