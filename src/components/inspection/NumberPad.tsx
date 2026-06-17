import { useState, useEffect } from "react";
import { useInspectionStore } from "@/store/useInspectionStore";
import { inspectionAreas } from "@/data/areas";

export default function NumberPad() {
  const { record, currentAreaIndex, updateAreaResult } = useInspectionStore();
  const [pressedKey, setPressedKey] = useState<number | null>(null);

  const currentArea = inspectionAreas[currentAreaIndex];
  const currentResult = record?.areas.find((a) => a.areaId === currentArea.id);
  const currentSeats = currentResult?.emptySeats ?? 0;

  const handleNumberClick = (num: number) => {
    setPressedKey(num);
    updateAreaResult(currentArea.id, { emptySeats: num });
    setTimeout(() => setPressedKey(null), 150);
  };

  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="card mb-6">
      <h4 className="text-2xl font-bold text-navy-500 mb-6 flex items-center gap-3">
        <span className="text-3xl">🪑</span>
        请输入本区域空座数量
      </h4>

      <div className="flex items-center gap-8">
        <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-inner">
          <span className="text-8xl font-bold text-primary-600">
            {currentSeats}
          </span>
        </div>

        <div className="flex-1 grid grid-cols-6 gap-3">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className={`big-number-btn text-3xl ${pressedKey === num ? "scale-90 bg-primary-500 text-white border-primary-600" : currentSeats === num ? "active" : ""}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-gray-500 text-lg mt-6">
        💡 提示：空座包括无人就坐的座位，请仔细清点
      </p>
    </div>
  );
}
