import Link from "next/link";

export default function GuidelinesPage() {
  return (
    <main className="max-w-3xl mx-auto p-8 mt-10 mb-20 bg-white rounded-lg shadow-sm border">
      <Link href="/home" className="text-blue-500 hover:underline mb-8 inline-block font-bold text-sm">
        ← トップに戻る
      </Link>

      <h1 className="text-3xl font-bold mb-10 text-gray-800 border-b pb-4">コミュニティガイドライン</h1>

      <div className="space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
        <p className="font-bold text-lg text-black mb-4">
          Gakuru Communityへようこそ！
        </p>
        <p>
          ここは、技術的な挑戦、世界観の構築、そして日々の小さな成長を互いに応援し、高め合うための場所です。すべてのメンバーが安心して建設的な議論を行えるよう、以下の3つのコア・ルールを大切にしています。
        </p>

        <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            💡 1. 「否定」ではなく「代替案」を
          </h2>
          <p className="mb-4">
            技術の選定やアイデアに対して異なる意見を持つことは素晴らしいことです。ただし、「それはダメだ」と否定するだけでは議論が停滞します。
          </p>
          <div className="bg-white p-4 rounded-lg border text-sm">
            <p className="text-red-500 font-bold mb-1">❌ 避けてほしいこと</p>
            <p className="mb-3 text-gray-600">「その設計はアンチパターンですよ。」</p>
            <p className="text-green-600 font-bold mb-1">⭕️ 歓迎されること</p>
            <p className="text-gray-600">「その設計だと〇〇でバグが起きやすいかもしれません。代わりに、このライブラリを使うのはどうでしょうか？」</p>
          </div>
        </section>

        <section className="bg-green-50 p-6 rounded-xl border border-green-100">
          <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
            🌱 2. 「差分」の成長を称え合う
          </h2>
          <p>
            他人の絶対的なスキルレベルと比較するのではなく、その人自身の「過去からの進歩や挑戦」を尊重します。環境構築ができた、小さなバグが直ったといった日々の小さな成果（差分）に対しても、リスペクトを持ってコミュニティ全体で歓迎しましょう。
          </p>
        </section>

        <section className="bg-purple-50 p-6 rounded-xl border border-purple-100">
          <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            🤝 3. 人格ではなく「事象」に向き合う
          </h2>
          <p>
            議論が白熱したときでも、対象は常に「ソースコード」や「アイデア」であり、それを書いた「人間」ではありません。常に敬意を払い、プロフェッショナルでフラットなコミュニケーションを心がけてください。
          </p>
        </section>

        <section className="mt-12 pt-8 border-t">
          <h2 className="text-lg font-bold text-gray-800 mb-3">違反を見かけた場合</h2>
          <p>
            もしルールに著しく反する攻撃的な書き込みや、不快なコミュニケーションを見かけた場合は、直接言い争うのではなく運営へお知らせください。利用規約に基づき、該当コンテンツの削除やアカウント制限など、適切な対応を行います。
          </p>
        </section>
      </div>
    </main>
  );
}