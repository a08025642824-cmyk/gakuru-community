"use client";

export default function MarkdownRenderer({ content }: { content: string }) {
  // 改行で分割して、1行ずつパースする簡単なロジック
  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-gray-800 text-sm leading-relaxed">
      {lines.map((line, index) => {
        // ### 小見出し
        if (line.startsWith("### ")) {
          return <h3 key={index} className="text-lg font-black text-gray-900 mt-4 mb-2 border-b pb-1">{line.replace("### ", "")}</h3>;
        }
        // #### さらに小さい見出し
        if (line.startsWith("#### ")) {
          return <h4 key={index} className="text-base font-bold text-gray-900 mt-3 mb-1">{line.replace("#### ", "")}</h4>;
        }
        // * または - 箇条書き
        if (line.startsWith("* ") || line.startsWith("- ")) {
          return (
            <ul key={index} className="list-disc list-inside pl-2 text-gray-700">
              <li>{line.replace(/^[\*\-]\s/, "")}</li>
            </ul>
          );
        }
        // 空行はスペースを開ける
        if (line.trim() === "") {
          return <div key={index} className="h-2" />;
        }
        // 通常のテキスト行
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}