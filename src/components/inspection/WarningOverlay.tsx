import { useEffect, useRef } from "react";
import { useInspectionStore } from "@/store/useInspectionStore";
import { speak, stopSpeaking } from "@/utils/speech";
import { Volume2, X } from "lucide-react";

export default function WarningOverlay() {
  const { warningVisible, setWarningVisible, getAllUncheckedAreas } = useInspectionStore();
  const spokenRef = useRef(false);

  useEffect(() => {
    if (warningVisible && !spokenRef.current) {
      const uncheckedAreas = getAllUncheckedAreas();
      const message = `请继续检查！还有${uncheckedAreas.length}个区域未检查：${uncheckedAreas.join("，")}`;
      speak(message, { rate: 0.85 });
      spokenRef.current = true;

      const interval = setInterval(() => {
        speak("请继续检查", { rate: 0.9 });
      }, 4000);

      return () => {
        clearInterval(interval);
        stopSpeaking();
        spokenRef.current = false;
      };
    }
  }, [warningVisible, getAllUncheckedAreas]);

  if (!warningVisible) return null;

  const uncheckedAreas = getAllUncheckedAreas();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-warning-600/95 backdrop-blur-sm animate-fade-in">
      <button
        onClick={() => {
          setWarningVisible(false);
          stopSpeaking();
        }}
        className="absolute top-8 right-8 w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <X className="w-10 h-10" />
      </button>

      <div className="text-center text-white px-12 max-w-5xl">
        <div className="mb-10">
          <span className="text-[10rem] animate-bounce-slow inline-block">⚠️</span>
        </div>

        <h2 className="text-8xl font-black mb-6 text-shadow animate-pulse">
          请继续检查！
        </h2>

        <div className="bg-white/20 backdrop-blur rounded-3xl p-10 mb-8">
          <p className="text-4xl font-bold mb-6">
            还有 <span className="text-yellow-300 text-6xl">{uncheckedAreas.length}</span> 个区域未检查
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {uncheckedAreas.map((area) => (
              <span
                key={area}
                className="bg-white text-warning-600 px-8 py-4 rounded-2xl text-3xl font-bold shadow-xl animate-shake"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-3xl opacity-90">
          <Volume2 className="w-10 h-10 animate-pulse" />
          <span className="font-bold">语音提示已开启</span>
        </div>

        <p className="text-2xl mt-8 opacity-80">
          请务必从车头走到车尾，检查每一个座位、每一条过道、每一处缝隙
        </p>
      </div>
    </div>
  );
}
