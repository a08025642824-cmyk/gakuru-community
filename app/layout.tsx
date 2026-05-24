import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
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
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="ja">
        <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
          
          <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              
              {/* 左側：ロゴ（スマホでは文字を隠してコンパクトに） */}
              <div className="flex items-center gap-4 sm:gap-8">
                <Link href="/" className="font-black text-lg sm:text-xl tracking-tighter text-black flex items-center gap-1 sm:gap-2">
                  <span className="bg-black text-white px-2 py-1 rounded text-xs sm:text-sm">G</span>
                  <span className="hidden sm:inline">Gakuru</span>
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
              <div className="flex items-center gap-3 sm:gap-5">
                {userId ? (
                  // 🌟 スマホ対応版：狭い画面ではアイコンのみ、ボタンも小さく表示
                  <>
                    <Link href="/dm" className="text-xl sm:text-sm font-bold text-gray-600 hover:text-black transition" title="DM">
                      ✉️<span className="hidden sm:inline"> DM</span>
                    </Link>
                    <Link href="/mypage" className="text-xl sm:text-sm font-bold text-gray-600 hover:text-black transition" title="マイページ">
                      👤<span className="hidden sm:inline"> マイページ</span>
                    </Link>
                    
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
                  // ログインしていない時
                  <div className="flex items-center gap-2 sm:gap-4 ml-1 sm:ml-2">
                    <SignInButton mode="modal">
                      <button className="text-xs sm:text-sm font-bold text-gray-600 hover:text-black transition">
                        ログイン
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-3 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-sm transition">
                        登録
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