import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 🌟 変更：ダッシュボードと、各コンテンツの詳細ページを誰でも見れるように開放！
const isPublicRoute = createRouteMatcher([
  '/', 
  '/about', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/home',           // ダッシュボードを開放
  '/thread(.*)',     // スレッド詳細を開放
  '/project(.*)',    // プロジェクト詳細を開放
  '/reviews(.*)'     // レビュー詳細を開放
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentUrl = new URL(req.url);

  // ログイン済みのユーザーがLP('/')にアクセスしたら、自動で'/home'に飛ばす（これはそのまま）
  if (userId && currentUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  // パブリックルート「以外」のページ（/mypage や /create などの作成画面）に
  // 未ログインでアクセスしようとしたら、Clerkのログイン画面に弾く
  if (!userId && !isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};