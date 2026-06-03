import Link from "next/link";

export default function EnhancedLandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* --- 背景の微細な光エフェクト --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-60 z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50/40 blur-[120px]"></div>
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-gray-50 to-purple-50/30 blur-[100px]"></div>
      </div>

      {/* --- Hero Section --- */}
      <section className="relative pt-36 pb-24 md:pt-52 md:pb-36 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* アナウンスバッジ */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-gray-100 bg-gray-50/50 backdrop-blur-md text-xs font-medium text-gray-600 mb-10 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            エンジニアのための新しい共創空間
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05] text-black">
            思考が交じり合い、<br />
            プロダクトが加速する。
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-14 max-w-3xl mx-auto leading-relaxed font-normal">
            Gakuruは、個人開発者やソフトウェアエンジニアがシームレスに交差するプラットフォーム。<br className="hidden sm:block" />
            深い意見交換とプロジェクトの共創を通じて、全員の知識向上とプロダクトの成功を実装します。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/home" 
              className="w-full sm:w-auto bg-black text-white text-sm font-semibold py-4 px-10 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5"
            >
              コミュニティに参加する
            </Link>
            <Link 
              href="/home" 
              className="w-full sm:w-auto bg-white text-gray-600 text-sm font-semibold py-4 px-10 rounded-xl border border-gray-200 hover:border-gray-400 hover:text-black transition-all duration-300"
            >
              ダッシュボードを見る
            </Link>
          </div>
        </div>
      </section>

      {/* --- Bento Grid Features Section --- */}
      <section className="py-24 bg-gray-50/50 border-t border-gray-100 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          
          <div className="mb-20 text-center sm:text-left">
            <span className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase block mb-3">Core Functions</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">
              知識のアップデートと、実装のサイクル
            </h2>
          </div>

          {/* 凝ったレイアウトを表現する非対称グリッド */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 大きなカード：意見交換 (2カラム分を使用) */}
            <div className="md:col-span-2 bg-white border border-gray-100 p-8 md:p-10 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 border border-gray-100 rounded-xl flex items-center justify-center bg-gray-50 mb-8 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">高次元な意見交換スレッド</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                  アーキテクチャの選定からニッチなエラーの解決まで。様々なスタックを持つエンジニアが交じり合うことで、一人では到達できなかった最適な設計やアプローチがその場で見つかります。
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-50 text-xs font-mono text-gray-400">
                // active_discussions_module
              </div>
            </div>

            {/* 通常のカード：プロジェクト */}
            <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 border border-gray-100 rounded-xl flex items-center justify-center bg-gray-50 mb-8 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">プロジェクト共創</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  アイデアを形にするための仲間を募集。必要なポジションを明確に提示し、チームビルディングから実際のリリースまでを同じ空間で完結させます。
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-50 text-xs font-mono text-gray-400">
                // build_together
              </div>
            </div>

            {/* 通常のカード：レビュー */}
            <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 border border-gray-100 rounded-xl flex items-center justify-center bg-gray-50 mb-8 group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">プロダクト批評</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Webアプリや成果物のURLを共有し、実践的なアドバイスを収集。お互いの「昨日からの進捗（差分）」を評価し合うカルチャーが根底にあります。
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-50 text-xs font-mono text-gray-400">
                // peer_review_system
              </div>
            </div>

            {/* 大きなカード：目的 (2カラム分を使用) */}
            <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8 md:p-10 rounded-2xl shadow-sm text-white flex flex-col justify-between group">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase block mb-4">Ultimate Goal</span>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                  全員の「知識向上」と「プロジェクトの成功」へ
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                  Gakuruの目的は、単にコードを共有することではありません。異なるスキルを持つコアメンバーが交じることで、相互に圧倒的な知識の向上を引き起こし、立ち上がったプロダクトを確実に成功へと導くエコシステムを構築します。
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-xs font-mono text-gray-500">
                // mission_accomplished
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-32 px-6 text-center relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black mb-6">
            そのアイデアに、最高の交差点を。
          </h2>
          <p className="text-gray-500 mb-10 text-sm sm:text-base">
            登録は数秒で完了します。新しい創出のサイクルを、ここから始めましょう。
          </p>
          <Link 
            href="/home" 
            className="inline-block bg-black text-white text-sm font-semibold py-4 px-12 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg shadow-black/10"
          >
            コミュニティのエントランスを開く
          </Link>
        </div>
      </section>

    </div>
  );
}