import { useState } from "react";
import { mockClasses } from "@/data/classes";
import { useRollcallStore } from "@/store/useRollcallStore";
import { useInspectionStore } from "@/store/useInspectionStore";
import { Check, ArrowRight } from "lucide-react";

export default function RollcallClassSelect() {
  const { startRollcall } = useRollcallStore();
  const { selectedClassIds: inspectionClasses } = useInspectionStore();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    inspectionClasses.length > 0 ? inspectionClasses : []
  );

  const toggleClass = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(mockClasses.map((c) => c.id));
  };

  return (
    <div className="p-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-success-100 rounded-full mb-6">
            <span className="text-5xl">👧</span>
          </div>
          <h2 className="text-4xl font-bold text-navy-500 mb-3">
            请选择要点名的班级
          </h2>
          <p className="text-xl text-gray-500">选择班级后开始儿童点名核对</p>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={selectAll}
            className="text-lg text-primary-600 font-bold hover:underline"
          >
            全选所有班级
          </button>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-10">
          {mockClasses.map((cls) => {
            const selected = selectedIds.includes(cls.id);
            return (
              <button
                key={cls.id}
                onClick={() => toggleClass(cls.id)}
                className={`relative p-8 rounded-3xl border-4 transition-all duration-200 text-left
                  ${selected
                    ? "border-success-500 bg-success-50 scale-105 shadow-xl"
                    : "border-gray-200 bg-white hover:border-success-300 hover:shadow-lg"
                  }`}
              >
                {selected && (
                  <div className="absolute top-4 right-4 w-10 h-10 bg-success-500 rounded-full flex items-center justify-center">
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
                <p className="text-lg text-gray-500 mt-1">
                  点击{selected ? "取消" : "选择"}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <p className="text-xl text-gray-500">
            已选择 <span className="font-bold text-success-600 text-2xl">{selectedIds.length}</span> 个班级
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => startRollcall(selectedIds)}
            disabled={selectedIds.length === 0}
            className={`px-16 py-6 rounded-3xl text-3xl font-bold text-white shadow-2xl transition-all flex items-center gap-4
              ${selectedIds.length > 0
                ? "bg-gradient-to-r from-success-500 to-teal-500 hover:scale-105 active:scale-100"
                : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            开始点名
            <ArrowRight className="w-10 h-10" />
          </button>
        </div>
      </div>
    </div>
  );
}
