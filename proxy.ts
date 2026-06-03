import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/about', '/sign-in(.*)', '/sign-up(.*)']);

// 🌟 1. コールバック関数に async を追加
export default clerkMiddleware(async (auth, req) => {
  // 🌟 2. await auth() で非同期にデータを取得する
  const { userId } = await auth();
  
  const currentUrl = new URL(req.url);

  if (userId && currentUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  if (!userId && !isPublicRoute(req)) {
    // 🌟 3. protect() も非同期になっているため、await をつける
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};