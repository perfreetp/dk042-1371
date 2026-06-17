import { inspectionAreas } from "@/data/areas";
import { useInspectionStore } from "@/store/useInspectionStore";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

export default function AreaGuide() {
  const { record, currentAreaIndex, setCurrentArea } = useInspectionStore();

  if (!record) return null;

  const currentArea = inspectionAreas[currentAreaIndex];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentArea(Math.max(0, currentAreaIndex - 1))}
            disabled={currentAreaIndex === 0}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
              ${currentAreaIndex === 0 ? "bg-gray-100 text-gray-300" : "bg-primary-100 text-primary-600 hover:bg-primary-200"}`}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="text-xl text-gray-500">
            第 <span className="text-3xl font-bold text-primary-600">{currentAreaIndex + 1}</span>
            /{inspectionAreas.length} 区域
          </div>
          <button
            onClick={() => setCurrentArea(Math.min(inspectionAreas.length - 1, currentAreaIndex + 1))}
            disabled={currentAreaIndex === inspectionAreas.length - 1}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
              ${currentAreaIndex === inspectionAreas.length - 1 ? "bg-gray-100 text-gray-300" : "bg-primary-100 text-primary-600 hover:bg-primary-200"}`}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
        <div className="flex gap-3">
          {inspectionAreas.map((area, idx) => {
            const result = record.areas.find((a) => a.areaId === area.id);
            const isChecked = result?.checked;
            const isCurrent = idx === currentAreaIndex;
            return (
              <button
                key={area.id}
                onClick={() => setCurrentArea(idx)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all text-2xl
                  ${isCurrent
                    ? "bg-primary-500 text-white shadow-xl scale-110"
                    : isChecked
                    ? "bg-success-500 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                {isChecked ? <Check className="w-8 h-8" /> : <span>{idx + 1}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6 bg-gradient-to-r from-primary-500 to-orange-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="w-32 h-32 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center">
          <span className="text-6xl">{currentArea.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-5xl font-bold mb-3">{currentArea.name}</h3>
          <p className="text-2xl opacity-90">{currentArea.description}</p>
        </div>
        <div className="text-right">
          <p className="text-lg opacity-75">当前检查</p>
          <p className="text-3xl font-bold mt-1">请仔细查看</p>
        </div>
      </div>
    </div>
  );
}
