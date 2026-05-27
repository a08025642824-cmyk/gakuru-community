import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0f172a] text-white px-4 py-16 selection:bg-blue-500/30">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* 404 視覚グラフィック (G + 消えた電球 + 途切れた矢印) */}
        <div className="relative flex justify-center">
          <svg
            className="w-48 h-48 text-slate-700 animate-pulse"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 背景のネットワーク線（薄く） */}
            <path d="M20 40 L60 80 M180 40 L140 80 M30 160 L80 130 M170 160 L130 130" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="60" cy="80" r="4" fill="#1e293b" />
            <circle cx="140" cy="80" r="4" fill="#1e293b" />
            
            {/* 大きな「G」のシルエット */}
            <path
              d="M140 65 C125 50 105 45 85 50 C55 58 35 88 35 120 C35 155 65 180 100 180 C135 180 160 155 160 120 L160 110 L100 110"
              stroke="#334155"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* 消えている（光っていない）電球 */}
            <circle cx="100" cy="95" r="20" stroke="#475569" strokeWidth="6" fill="#1e293b" />
            <path d="M90 115 L110 115 M93 121 L107 121 M96 127 L104 127" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            
            {/* 途切れた上向き矢印 */}
            <path d="M145 150 L145 135 M145 135 L138 142 M145 135 L152 142" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="145" y1="158" x2="145" y2="162" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            
            {/* くすんだ星 */}
            <path d="M60 140 L62 145 L67 145 L63 148 L65 153 L60 150 L55 153 L57 148 L53 145 L58 145 Z" fill="#475569" />
          </svg>

          {/* 404の吹き出しポッピン */}
          <div className="absolute top-4 right-12 bg-amber-500 text-slate-950 text-xs font-black px-2 py-1 rounded-md shadow-lg transform rotate-12 select-none">
            404: Not Found
          </div>
        </div>

        {/* テキストエリア */}
        <div className="space-y-3">
          <p className="text-xs font-bold tracking-widest text-blue-400 uppercase">
            Gakuru Community
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-100">
            ページが見つかりません
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-sm mx-auto mt-4">
            このアイデアはうまく閃かなかったようです。ご安心ください、多くの素晴らしいイノベーションは予期せぬ道のりから始まります。ガクルの探求は続きます。
          </p>
        </div>

        {/* アクションボタン */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-full text-sm shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-200 active:scale-95"
          >
            🚀 コミュニティのホームへ戻る
          </Link>
        </div>
        
      </div>
    </main>
  );
}