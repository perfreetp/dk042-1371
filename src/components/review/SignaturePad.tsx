import { useRef, useEffect, useState } from "react";
import { Eraser, Check } from "lucide-react";

interface SignaturePadProps {
  onConfirm: (dataUrl: string) => void;
}

export default function SignaturePad({ onConfirm }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1D3557";
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx || !lastPos.current) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasSignature(true);
  };

  const endDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirm = () => {
    if (!canvasRef.current || !hasSignature) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onConfirm(dataUrl);
  };

  return (
    <div className="card">
      <h4 className="text-2xl font-bold text-navy-500 mb-6 flex items-center gap-3">
        <span className="text-3xl">✍️</span>
        请在此处签名确认
      </h4>

      <div
        className="relative border-4 border-dashed border-gray-300 rounded-2xl bg-gray-50 overflow-hidden"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-2xl text-gray-400">请在上方区域手写签名...</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6 justify-end">
        <button
          onClick={clearCanvas}
          className="btn-secondary flex items-center gap-2"
        >
          <Eraser className="w-6 h-6" />
          清除重签
        </button>
        <button
          onClick={handleConfirm}
          disabled={!hasSignature}
          className={`px-10 py-4 rounded-2xl text-2xl font-bold shadow-xl transition-all flex items-center gap-3
            ${hasSignature
              ? "bg-gradient-to-r from-success-500 to-teal-500 text-white hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          <Check className="w-7 h-7" />
          确认签名
        </button>
      </div>
    </div>
  );
}
