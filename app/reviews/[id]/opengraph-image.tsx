import { ImageResponse } from 'next/og';
import { db } from '../../../db/index';
import { reviewRequests, users } from '../../../db/schema';
import { eq } from 'drizzle-orm';

// OGP画像の標準サイズ
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// 🌟 URLのパラメータ（id）を受け取って画像を生成する関数
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // DBから対象のレビュー募集のタイトルと作者名を取得
  const data = await db
    .select({
      title: reviewRequests.title,
      authorName: users.name,
    })
    .from(reviewRequests)
    .leftJoin(users, eq(reviewRequests.authorId, users.id))
    .where(eq(reviewRequests.id, id))
    .limit(1);

  const review = data[0];
  const title = review?.title || '新しいアプリのレビューを募集しています';
  const authorName = review?.authorName || 'Gakuru ユーザー';

  return new ImageResponse(
    (
      // ここから下は通常のHTML/CSSのように書けます（Tailwindは一部制限があるのでstyle直書きが安全です）
      <div
        style={{
          background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        {/* 上部のラベル */}
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: 30,
            backgroundColor: '#eff6ff',
            padding: '10px 30px',
            borderRadius: '50px',
            border: '2px solid #bfdbfe',
          }}
        >
          🎯 レビュー募集中！
        </div>

        {/* メインのタイトル */}
        <div
          style={{
            fontSize: 64,
            fontWeight: '900',
            color: '#0f172a',
            textAlign: 'center',
            lineHeight: 1.3,
            marginBottom: 40,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </div>

        {/* 下部のフッター */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 32,
            color: '#64748b',
            marginTop: 'auto',
            fontWeight: 'bold',
          }}
        >
          <span style={{ color: '#000', marginRight: '16px' }}>Gakuru</span>
          Developed by {authorName}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}