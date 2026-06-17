import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { stopSpeaking } from "@/utils/speech";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  extra?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  showBack = true,
  extra,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    if (!muted) {
      stopSpeaking();
    }
    setMuted(!muted);
  };

  return (
    <div className="bg-white shadow-lg px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {showBack && (
          <button
            onClick={() => navigate("/")}
            className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-8 h-8 text-gray-600" />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold text-navy-500">{title}</h1>
          {subtitle && (
            <p className="text-lg text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {extra}
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            muted ? "bg-gray-200 text-gray-500" : "bg-primary-50 text-primary-500 hover:bg-primary-100"
          }`}
        >
          {muted ? (
            <VolumeX className="w-7 h-7" />
          ) : (
            <Volume2 className="w-7 h-7" />
          )}
        </button>
      </div>
    </div>
  );
}
