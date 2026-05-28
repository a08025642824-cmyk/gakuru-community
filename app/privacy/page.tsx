import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto p-8 mt-10 mb-20 bg-white rounded-lg shadow-sm border">
      <Link href="/" className="text-blue-500 hover:underline mb-8 inline-block font-bold text-sm">
        ← トップに戻る
      </Link>

      <h1 className="text-3xl font-bold mb-10 text-gray-800 border-b pb-4">プライバシーポリシー</h1>

      <div className="space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
        <p>
          【 gakuru community 】（以下「運営者」といいます。）は、本Webサービス「【 Gakuru AI コミュニティ 】」（以下「本サービス」といいます。）におけるユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
        </p>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第1条（取得する個人情報および収集方法）</h2>
          <p className="mb-2">本サービスでは、以下の方法により個人情報および利用データを取得します。</p>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>外部認証サービス（Clerk）経由での取得</strong><br />
              ユーザーが本サービスにログインする際、認証プロバイダであるClerkを通じて、ユーザーの「氏名」「ユーザー名」「メールアドレス」「プロファイル画像URL」を自動的に取得します。本サービス側で生パスワードを保持することはありません。
            </li>
            <li>
              <strong>本サービスの利用に伴う情報</strong><br />
              ユーザーが投稿したスレッド、コメント、プロジェクト募集情報、チャットメッセージ、および添付された画像データ（Vercel Blob等に保存されます）。
            </li>
            <li>
              <strong>行動ログおよび評価データ</strong><br />
              本サービス内の「💡 クリティカル評価」の投票履歴。なお、この評価データはアルゴリズムによるトレンド集計のために裏側でのみ使用され、他のユーザーに対して個別の投票数や内訳が公開されることはありません。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第2条（個人情報の利用目的）</h2>
          <p className="mb-2">運営者は、取得した個人情報を以下の目的のために利用します。</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>本サービスへのログインおよび本人確認のため</li>
            <li>ユーザー個人のマイページ、および投稿内容（スレッド、チャット等）の表示のため</li>
            <li>本サービス内におけるトレンド順ランキングの計算・最適化のため</li>
            <li>利用規約に違反する悪質な行為（荒らし、誹謗中傷等）への対応および不正利用防止のため</li>
            <li>ユーザーからのお問い合わせに対応するため</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第3条（個人情報の第三者提供）</h2>
          <p className="mb-2">運営者は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li>国の機関若しくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第4条（個人情報の安全管理）</h2>
          <p>
            本サービスでは、ユーザー認証およびデータ管理の安全性を高めるため、Clerk、Supabase/PostgreSQL/Turso、Vercel等の信頼性の高い外部クラウドサービスを採用し、適切なアクセス制御とセキュリティ対策を講じています。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第5条（プライバシーポリシーの変更）</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>本ポリシーの内容は、ユーザーに通知することなく、変更することができるものとします。</li>
            <li>運営者が別途定める場合を除いて、変更後のプライバシーポリシーは、本サービス上に掲載したときから効力を生じるものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第6条（お問い合わせ窓口）</h2>
          <p className="mb-2">本ポリシーに関するお問い合わせは、以下の窓口までお願いいたします。</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>運営者：【 運営者名またはチーム名 】</li>
            <li>連絡先：【 メールアドレス、またはお問い合わせ用フォーム/Discordのリンク等 】</li>
          </ul>
        </section>

        <div className="mt-12 pt-8 border-t text-right text-gray-500 font-bold">
          施行日：2026年【 5月25日 】
        </div>
      </div>
    </main>
  );
}