import { mockClasses } from "@/data/classes";
import { useInspectionStore } from "@/store/useInspectionStore";
import { Check } from "lucide-react";

export default function ClassSelector() {
  const { selectedClassIds, selectClass, canStartInspection, startInspection } =
    useInspectionStore();

  return (
    <div className="p-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6">
            <span className="text-5xl">🏫</span>
          </div>
          <h2 className="text-4xl font-bold text-navy-500 mb-3">
            请选择本趟应下车班级
          </h2>
          <p className="text-xl text-gray-500">可多选，确认后开始离车检查</p>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-10">
          {mockClasses.map((cls) => {
            const selected = selectedClassIds.includes(cls.id);
            return (
              <button
                key={cls.id}
                onClick={() => selectClass(cls.id, !selected)}
                className={`relative p-8 rounded-3xl border-4 transition-all duration-200 text-left
                  ${selected
                    ? "border-primary-500 bg-primary-50 scale-105 shadow-xl"
                    : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg"
                  }`}
              >
                {selected && (
                  <div className="absolute top-4 right-4 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                )}
                <div
                  className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl font-bold text-white"
                  style={{ backgroundColor: cls.color }}
                >
                  {cls.name.slice(0, 2)}
                </div>
                <p className="text-2xl font-bold text-navy-500">{cls.name}</p>
                <p className="text-lg text-gray-500 mt-1">点击选择</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4">
          <p className="text-xl text-gray-500">
            已选择 <span className="font-bold text-primary-600 text-2xl">{selectedClassIds.length}</span> 个班级
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={startInspection}
            disabled={!canStartInspection()}
            className={`px-16 py-6 rounded-3xl text-3xl font-bold text-white shadow-2xl transition-all
              ${canStartInspection()
                ? "bg-gradient-to-r from-primary-500 to-orange-500 hover:scale-105 active:scale-100"
                : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            开始离车检查 →
          </button>
        </div>
      </div>
    </div>
  );
}
