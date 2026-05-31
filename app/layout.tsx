import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import AuthButtonsWithAgreement from "./components/AuthButtonsWithAgreement"; 
import MemoHeaderButton from "./components/MemoHeaderButton"; // 🌟 追加：メモボタンをインポート

// 🌟 DBとスキーマをインポート
import { db } from "../db/index";
import { notifications } from "../db/schema";
import { and, eq } from "drizzle-orm";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gakuru Community",
  description: "共創プラットフォーム",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  let unreadCount = 0;
  if (userId) {
    const unreadNotifications = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    unreadCount = unreadNotifications.length;
  }

  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>

          <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

              {/* 左側：ロゴとナビゲーション */}
              <div className="flex items-center gap-4 sm:gap-8">
                <Link href="/" className="font-black text-lg sm:text-xl tracking-tighter text-black flex items-center gap-2 hover:opacity-80 transition">
                  <img src="/icon.png" alt="Gakuru Community" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                  <span className="hidden sm:inline">Gakuru</span>
                </Link>

               
              </div>

              {/* 右側：ログイン状態に応じたメニュー */}
              <div className="flex items-center gap-3 sm:gap-5">
                {userId ? (
                  <>
                    {/* 🌟 1. AIメモ（セカンドブレイン）ボタンを追加 */}
                    <MemoHeaderButton />

                    {/* 🔔 通知 */}
                    <Link href="/notifications" className="group relative text-xl sm:text-sm font-bold text-gray-600 hover:text-black transition">
                      🔔
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                      {/* 🌟 ツールチップ（PCではホバー、スマホでは長押しで出現） */}
                      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-normal px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        通知
                      </span>
                    </Link>

                    {/* ✉️ DM */}
                    <Link href="/dm" className="group relative text-xl sm:text-sm font-bold text-gray-600 hover:text-black transition">
                      ✉️<span className="hidden sm:inline"> DM</span>
                      {/* PC版ではテキストが横に出ているので、スマホ版（sm:hidden）の時だけツールチップを出すようにしています */}
                      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-normal px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 sm:hidden">
                        DM
                      </span>
                    </Link>
                    
                    {/* 👤 マイページ */}
                    <Link href="/mypage" className="group relative text-xl sm:text-sm font-bold text-gray-600 hover:text-black transition">
                      👤<span className="hidden sm:inline"> マイページ</span>
                      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-normal px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 sm:hidden">
                        マイページ
                      </span>
                    </Link>

                    {/* スレッド・プロジェクト作成ボタン */}
                    <div className="flex items-center gap-1 sm:gap-2 border-l pl-2 sm:pl-4 ml-1 sm:ml-2">
                      <Link href="/create" className="bg-gray-100 text-gray-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 sm:py-2 rounded hover:bg-gray-200 transition">
                        <span className="sm:hidden">＋💬</span>
                        <span className="hidden sm:inline">＋ スレッド</span>
                      </Link>
                      <Link href="/project/create" className="bg-black text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 sm:py-2 rounded hover:bg-gray-800 transition">
                        <span className="sm:hidden">＋🚀</span>
                        <span className="hidden sm:inline">＋ プロジェクト</span>
                      </Link>
                    </div>

                    <div className="ml-1 sm:ml-2 flex items-center">
                      <UserButton />
                    </div>
                  </>
                ) : (
                  <AuthButtonsWithAgreement variant="header" />
                )}
              </div>
            </div>
          </header>

          {/* メインコンテンツ */}
          <div className="flex-grow">
            {children}
          </div>

          {/* フッター */}
          <footer className="bg-white border-t py-8 mt-12">
            <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
              <div className="flex gap-6 text-sm font-bold text-gray-500">
                <Link href="/terms" className="hover:text-black transition">利用規約</Link>
                <Link href="/privacy" className="hover:text-black transition">プライバシーポリシー</Link>
                <Link href="/guidelines" className="text-blue-500 hover:text-blue-600 transition">コミュニティガイドライン</Link>
              </div>
              <p className="text-xs text-gray-400">© 2026 Gakuru Community</p>
            </div>
          </footer>

        </body>
      </html>
    </ClerkProvider>
  );
}