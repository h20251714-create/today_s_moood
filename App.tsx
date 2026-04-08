/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Flame, 
  CloudRain, 
  Leaf, 
  Zap, 
  Download, 
  Music, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  RefreshCw,
  Play,
  Pause
} from "lucide-react";
import { GoogleGenAI, Modality } from "@google/genai";
import { toPng } from "html-to-image";
import { EMOTIONS, EmotionType, EmotionConfig } from "./constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionConfig | null>(null);
  const [diaryText, setDiaryText] = useState("");
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const diaryLength = diaryText.length;
  const baseSize = 280;
  const maxSize = 400;
  const shapeSize = Math.min(maxSize, baseSize + diaryLength * 0.2);

  const handleGenerateMusic = async () => {
    if (!selectedEmotion) return;
    
    setIsGeneratingMusic(true);
    setAudioUrl(null);
    
    try {
      const response = await ai.models.generateContentStream({
        model: "lyria-3-clip-preview",
        contents: `${selectedEmotion.musicPrompt} The music should reflect the feeling of: ${diaryText.slice(0, 100)}`,
      });

      let audioBase64 = "";
      let mimeType = "audio/wav";

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
        }
      }

      if (audioBase64) {
        const binary = atob(audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error("Music generation failed:", error);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleSaveImage = async () => {
    if (cardRef.current === null) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, backgroundColor: '#f0f9ff' });
      const link = document.createElement("a");
      link.download = `emotion-diary-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to save image:", err);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (step === 3 && !audioUrl && !isGeneratingMusic) {
      handleGenerateMusic();
    }
  }, [step]);

  const renderShape = (config: EmotionConfig, size: number, children?: ReactNode) => {
    const color = config.color;
    const commonClasses = "flex items-center justify-center p-8 text-center overflow-hidden";
    
    switch (config.shape) {
      case "circle":
        return (
          <motion.div 
            style={{ width: size, height: size, backgroundColor: `${color}15`, borderColor: color, borderWidth: 2 }} 
            className={`rounded-full shadow-xl shadow-${config.id}-400/20 ${commonClasses}`}
          >
            {children}
          </motion.div>
        );
      case "triangle":
        return (
          <motion.div 
            style={{ 
              width: size, 
              height: size, 
              backgroundColor: `${color}15`,
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              border: `2px solid ${color}` // Note: border doesn't work well with clip-path, using a wrapper or shadow instead
            }} 
            className={`${commonClasses} pt-16`}
          >
            <div className="absolute inset-0 border-2 border-current pointer-events-none" style={{ color, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
            {children}
          </motion.div>
        );
      case "square":
        return (
          <motion.div 
            style={{ width: size, height: size, backgroundColor: `${color}15`, borderColor: color, borderWidth: 2 }} 
            className={`rounded-3xl shadow-xl shadow-${config.id}-400/20 ${commonClasses}`}
          >
            {children}
          </motion.div>
        );
      case "hexagon":
        return (
          <motion.div 
            style={{ 
              width: size, 
              height: size * 0.86, 
              backgroundColor: `${color}15`,
              clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
            }} 
            className={`${commonClasses}`}
          >
            <div className="absolute inset-0 border-2 border-current pointer-events-none" style={{ color, clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }} />
            {children}
          </motion.div>
        );
      case "star":
        return (
          <motion.div 
            style={{ 
              width: size, 
              height: size, 
              backgroundColor: `${color}15`,
              clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
            }} 
            className={`${commonClasses}`}
          >
            <div className="absolute inset-0 border-2 border-current pointer-events-none" style={{ color, clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }} />
            {children}
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-slate-900 font-sans selection:bg-sky-200 overflow-hidden flex flex-col">
      {/* Background Atmosphere - Sky Theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-sky-100 to-white" />
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-white/60 blur-[100px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-sky-200/40 blur-[120px]"
        />
        {/* Soft clouds */}
        <div className="absolute top-[20%] right-[15%] w-32 h-12 bg-white/40 rounded-full blur-xl" />
        <div className="absolute top-[40%] left-[5%] w-48 h-16 bg-white/30 rounded-full blur-2xl" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full text-center space-y-12"
            >
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight text-slate-800">오늘 당신의 기분은 어떤가요?</h1>
                <p className="text-slate-500 text-lg">감정을 선택하면 당신만의 예쁜 도형이 만들어집니다.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion.id}
                    onClick={() => {
                      setSelectedEmotion(emotion);
                      setStep(2);
                    }}
                    className={`group relative flex flex-col items-center p-8 rounded-[2rem] border transition-all duration-500 ${
                      selectedEmotion?.id === emotion.id 
                        ? "bg-white border-sky-200 shadow-xl shadow-sky-100 scale-105" 
                        : "bg-white/60 border-white/40 hover:bg-white hover:border-sky-100 hover:shadow-lg"
                    }`}
                  >
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundColor: `${emotion.color}15`, color: emotion.color }}
                    >
                      <emotion.icon size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-lg font-semibold text-slate-700">{emotion.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && selectedEmotion && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-2xl space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setStep(1)}
                  className="p-3 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
                >
                  <ChevronLeft size={24} className="text-slate-600" />
                </button>
                <h2 className="text-3xl font-bold text-slate-800">오늘의 이야기를 들려주세요</h2>
              </div>

              <div className="relative">
                <textarea
                  value={diaryText}
                  onChange={(e) => setDiaryText(e.target.value)}
                  placeholder="지금 이 순간의 감정을 자유롭게 적어보세요..."
                  className="w-full h-64 bg-white/80 border border-white rounded-[2.5rem] p-10 text-xl font-medium focus:outline-none focus:ring-4 focus:ring-sky-100 focus:bg-white transition-all resize-none placeholder:text-slate-300 shadow-sm"
                  autoFocus
                />
                <div className="absolute bottom-8 right-10 text-slate-300 font-mono text-sm">
                  {diaryLength} characters
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setStep(3)}
                  disabled={!diaryText.trim()}
                  className="group flex items-center gap-3 bg-sky-500 text-white px-12 py-5 rounded-full text-lg font-bold hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-200"
                >
                  도형 완성하기
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && selectedEmotion && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full flex flex-col items-center space-y-12"
            >
              {/* Card Preview */}
              <div 
                ref={cardRef}
                className="relative w-full max-w-md aspect-[3/4] bg-white rounded-[3rem] p-10 flex flex-col items-center justify-between overflow-hidden shadow-2xl shadow-sky-200/50"
              >
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(${selectedEmotion.color} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
                </div>

                <div className="text-slate-300 font-mono text-xs tracking-widest uppercase font-bold">
                  {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                <div className="flex-1 flex items-center justify-center w-full relative">
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    {renderShape(selectedEmotion, shapeSize, (
                      <p className="text-slate-800 text-xl font-semibold leading-relaxed max-w-[80%]">
                        {diaryText}
                      </p>
                    ))}
                  </motion.div>
                </div>

                <div className="w-full pt-8 border-t border-slate-50 flex items-center justify-center gap-3">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: selectedEmotion.color }} />
                  <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">{selectedEmotion.label}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex-1 bg-white/80 border border-white rounded-3xl p-5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${isGeneratingMusic ? 'animate-spin' : ''}`} style={{ backgroundColor: `${selectedEmotion.color}15`, color: selectedEmotion.color }}>
                        {isGeneratingMusic ? <RefreshCw size={20} /> : <Music size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{isGeneratingMusic ? "음악 생성 중..." : "감정의 멜로디"}</p>
                        <p className="text-xs text-slate-400">{isGeneratingMusic ? "AI가 작곡 중입니다" : "이 도형을 위한 음악"}</p>
                      </div>
                    </div>
                    {audioUrl && (
                      <button 
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-100 transition-colors"
                      >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white text-slate-600 px-6 py-5 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm border border-slate-100"
                  >
                    다시 만들기
                  </button>
                  <button
                    onClick={handleSaveImage}
                    className="flex-[2] bg-slate-900 text-white px-8 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                    <Download size={20} />
                    카드 저장하기
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 p-10 text-center text-slate-300 text-xs font-mono tracking-widest uppercase font-bold">
        Emotion Shape Diary &copy; 2026
      </footer>
    </div>
  );
}
