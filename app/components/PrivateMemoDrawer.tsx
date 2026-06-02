"use client";

import { useState, useEffect } from "react";
import { summarizeAndSaveMemo } from "../actions/memo";
import Link from "next/link";

export default function PrivateMemoDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  
  // 🌟 変更点1：テキストの保存場所を「確定分」と「モヤモヤ（認識中）分」に分ける
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "ja-JP";

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";

        // 🌟 変更点2：確定した文章と、今喋っている文章をそれぞれ振り分ける
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        // 確定した分は、過去のテキストの後ろにガッチャンコして蓄積（prevを使うのが消えないコツ！）
        if (final) {
          setFinalText((prev) => prev + final);
        }
        // 今喋っている最中の分は常に上書き更新
        setInterimText(interim);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Error:", e);
        if (e.error === "not-allowed") {
          alert("マイクへのアクセスがブロックされています。");
        }
        setIsRecording(false);
      };

      rec.onend = () => setIsRecording(false);

      setRecognition(rec);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
    } else {
      // 🌟 変更点3：もう一度録音ボタンを押した時に、あえてテキストをリセットしない
      // これにより、一時停止しても続きから喋り始められます
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSaveSummary = async () => {
    // 保存時は、確定分とモヤモヤ分を両方くっつけて送る
    const fullText = finalText + interimText;
    if (!fullText.trim()) return;
    
    setIsLoading(true);
    const res = await summarizeAndSaveMemo(fullText);
    setIsLoading(false);
    
    if (res.success) {
      alert("第二の脳に記憶しました！🧠");
      setFinalText("");
      setInterimText("");
      onClose();
    } else {
      alert(res.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between border-l">
        <div>
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
              🧠 セカンドブレイン
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              アイデア、バグ、今日の差分などをマイクに向かってボヤいてください。
            </p>

            <div className="flex justify-center py-6">
              <button
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
                  isRecording 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                <span className="text-2xl mb-1">{isRecording ? "⏹️" : "🎙️"}</span>
                {isRecording ? "録音中..." : "話を聴く"}
              </button>
            </div>

            {/* 🌟 変更点4：確定分を黒字、認識中の分をグレーで表示するリッチなUI */}
            <div className="border rounded-lg bg-gray-50 h-48 flex flex-col focus-within:ring-2 focus-within:ring-black transition overflow-hidden">
              <textarea
                value={finalText}
                onChange={(e) => setFinalText(e.target.value)}
                placeholder="ここに喋った言葉が入力されます。キーボードでの直接修正も可能です..."
                className="flex-1 w-full bg-transparent p-4 outline-none resize-none text-sm leading-relaxed text-gray-800 font-mono"
              />
              
              {/* 喋っている最中の言葉は、テキストエリアの下部にグレーで表示 */}
              {interimText && (
                <div className="px-4 pb-4 text-gray-400 text-sm font-mono italic animate-pulse border-t border-gray-100 pt-2 bg-gray-100/50">
                  {interimText}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={handleSaveSummary}
            disabled={!(finalText || interimText).trim() || isLoading}
            className={`w-full font-bold py-3.5 rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
              (finalText || interimText).trim() && !isLoading
                ? "bg-black hover:bg-gray-800 text-white cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span>⚡ Groqが爆速要約中...</span>
            ) : (
              <><span></span> Groqで要約して脳に保存</>
            )}
          </button>

          <Link 
            href="/brain" 
            onClick={onClose} // クリックしたらドロワーを閉じて遷移する
            className="block w-full text-center text-xs font-bold text-gray-500 hover:text-black transition"
          >
            📚 過去の記憶一覧を見る →
          </Link>
        </div>
      </div>
    </div>
  );
}