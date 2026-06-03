import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto p-8 mt-10 mb-20 bg-white rounded-lg shadow-sm border">
      <Link href="/home" className="text-blue-500 hover:underline mb-8 inline-block font-bold text-sm">
        ← トップに戻る
      </Link>

      <h1 className="text-3xl font-bold mb-10 text-gray-800 border-b pb-4">利用規約</h1>

      <div className="space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
        <p>
          本利用規約（以下「本規約」といいます。）は、【 gakuru community 】（以下「運営者」といいます。）が提供するWebサービス「【 Gakuru AI コミュニティ 】」（以下「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆様（以下「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。
        </p>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第1条（適用）</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>本規約は、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されるものとします。</li>
            <li>運営者が本サービス上で掲載する各種ルールやガイドライン（コミュニティルール等）は、本規約の一部を構成するものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第2条（利用登録・認証）</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>本サービスの利用登録およびログインには、外部認証サービス（Clerk）が使用されます。</li>
            <li>ユーザーは、自己の責任において認証アカウントを適切に管理するものとし、これを第三者に利用させ、または貸与、譲渡、名義変更、売買等をしてはならないものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第3条（禁止事項）</h2>
          <p className="mb-2">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>法令または公序良俗に反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>他のユーザーに対する誹謗中傷、脅迫、いやがらせ、または人格を否定する行為</li>
            <li>スレッドやチャット等において、建設的な代替案を提示することなく、他者のアイデアや成果物を一方的に非難・攻撃する行為</li>
            <li>本サービスを男女の交際、出会い、またはわいせつな行為の媒介を目的として利用する行為</li>
            <li>運営者、他のユーザー、または第三者の著作権、商標権等の知的財産権を侵害する行為（ソースコードやコンテンツの無断転載を含む）</li>
            <li>本サービスのサーバーやネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第4条（投稿コンテンツの権利および削除権限）</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>ユーザーが本サービス内に投稿したテキスト、画像、ソースコード等のコンテンツの著作権は、当該投稿を行ったユーザー本人に帰属します。</li>
            <li>運営者は、ユーザーが第3条（禁止事項）に違反した場合、またはプロバイダ責任制限法に基づく正当な削除要請があった場合、ユーザーに事前に通知することなく、該当する投稿コンテンツ（チャット、コメント、スレッド、画像等）の全部または一部を削除、あるいは非表示にできるものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第5条（本サービスの提供の停止等）</h2>
          <p>
            運営者は、システムの保守点検、アップデート、または予期せぬサーバーエラー等の不可抗力により、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。これによってユーザーに生じた損害について、運営者は一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第6条（免責事項）</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。</li>
            <li>運営者は、本サービスに関してユーザーと他のユーザーまたは第三者との間において生じた取引、連絡、紛争（プロジェクト内でのトラブル等）について、一切責任を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第7条（利用規約の変更）</h2>
          <p>
            運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、ユーザーが本サービスを利用した場合には、ユーザーは変更後の規約に同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">第8条（準拠法・裁判管轄）</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>本サービスに関して紛争が生じた場合には、運営者の居住地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</li>
          </ol>
        </section>

        <div className="mt-12 pt-8 border-t text-right text-gray-500 font-bold">
          施行日：2026年【 5月25日 】
        </div>
      </div>
    </main>
  );
}