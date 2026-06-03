"use client";

import { usePathname } from "next/navigation";

export default function ConditionalVisibility({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 🌟 現在のURLが "/" (LPページ) の場合は何も表示しない
  if (pathname === "/") {
    return null;
  }

  // それ以外のページ（/home, /project/* など）では中身を表示する
  return <>{children}</>;
}