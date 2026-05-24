import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server"; // サーバーサイドでの認証判定用
import Link from "next/link";

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
  // サーバーサイドでログイン状態を取得
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
          
          <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
              
              {/* 左側：ロゴとメインナビゲーション */}
              <div className="flex items-center gap-8">
                <Link href="/" className="font-black text-xl tracking-tighter text-black flex items-center gap-2">
                  <span className="bg-black text-white px-2 py-1 rounded text-sm">G</span>
                  Gakuru
                </Link>
                
                <nav className="hidden md:flex items-center gap-6">
                  <Link href="/?tab=threads" className="text-sm font-bold text-gray-600 hover:text-black transition">
                    💬 スレッド
                  </Link>
                  <Link href="/?tab=projects" className="text-sm font-bold text-gray-600 hover:text-black transition">
                    🚀 プロジェクト
                  </Link>
                </nav>
              </div>

              {/* 右側：ログイン状態に応じたメニュー */}
              <div className="flex items-center gap-5">
                {userId ? (
                  // ログインしている時
                  <>
                    <Link href="/dm" className="text-sm font-bold text-gray-600 hover:text-black transition hidden sm:block">
                      ✉️ DM
                    </Link>
                    <Link href="/mypage" className="text-sm font-bold text-gray-600 hover:text-black transition hidden sm:block">
                      👤 マイページ
                    </Link>
                    
                    <div className="flex items-center gap-2 border-l pl-4 ml-2">
                      <Link href="/create" className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-2 rounded hover:bg-gray-200 transition">
                        ＋ スレッド
                      </Link>
                      <Link href="/project/create" className="bg-black text-white text-xs font-bold px-3 py-2 rounded hover:bg-gray-800 transition">
                        ＋ プロジェクト
                      </Link>
                    </div>

                    <div className="ml-2 flex items-center">
                      <UserButton />
                    </div>
                  </>
                ) : (
                  // ログインしていない時
                  <div className="flex items-center gap-4 ml-2">
                    <SignInButton mode="modal">
                      <button className="text-sm font-bold text-gray-600 hover:text-black transition">
                        ログイン
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-full shadow-sm transition">
                        新規登録
                      </button>
                    </SignUpButton>
                  </div>
                )}
              </div>
            </div>
          </header>

          {children}

        </body>
      </html>
    </ClerkProvider>
  );
}