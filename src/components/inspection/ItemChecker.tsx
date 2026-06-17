import { useInspectionStore } from "@/store/useInspectionStore";
import { inspectionAreas } from "@/data/areas";
import { LEFTOVER_ITEMS } from "@/types";
import { Check } from "lucide-react";

export default function ItemChecker() {
  const { record, currentAreaIndex, updateAreaResult } = useInspectionStore();

  const currentArea = inspectionAreas[currentAreaIndex];
  const currentResult = record?.areas.find((a) => a.areaId === currentArea.id);
  const selectedItems = currentResult?.leftoverItems ?? [];

  const toggleItem = (itemId: string) => {
    const newItems = selectedItems.includes(itemId)
      ? selectedItems.filter((id) => id !== itemId)
      : [...selectedItems, itemId];
    updateAreaResult(currentArea.id, { leftoverItems: newItems });
  };

  return (
    <div className="card">
      <h4 className="text-2xl font-bold text-navy-500 mb-6 flex items-center gap-3">
        <span className="text-3xl">🎒</span>
        请检查是否有遗留物品（点击勾选）
      </h4>

      <div className="grid grid-cols-6 gap-4">
        {LEFTOVER_ITEMS.map((item) => {
          const selected = selectedItems.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`relative p-6 rounded-3xl border-4 transition-all duration-200 flex flex-col items-center
                ${selected
                  ? "border-warning-500 bg-warning-50 scale-105 shadow-xl"
                  : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg"
                }`}
            >
              {selected && (
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-warning-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-5xl mb-3">{item.icon}</span>
              <p className="text-xl font-bold text-navy-500">{item.name}</p>
            </button>
          );
        })}
      </div>

      {selectedItems.length > 0 && (
        <div className="mt-6 bg-warning-50 border-2 border-warning-200 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-4xl">⚠️</span>
          <div>
            <p className="text-xl font-bold text-warning-600">
              已发现 {selectedItems.length} 件遗留物品，请妥善保管并联系相关人员
            </p>
            <p className="text-lg text-warning-500 mt-1">
              {selectedItems
                .map((id) => LEFTOVER_ITEMS.find((i) => i.id === id)?.name)
                .join("、")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
