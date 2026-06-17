import { useRollcallStore } from "@/store/useRollcallStore";
import ChildCard from "./ChildCard";
import { mockClasses } from "@/data/classes";

export default function PendingList() {
  const { getPendingChildren, selectedClassIds } = useRollcallStore();
  const pendingChildren = getPendingChildren();

  if (pendingChildren.length === 0) return null;

  const classesToShow = selectedClassIds.length > 0
    ? mockClasses.filter((c) => selectedClassIds.includes(c.id))
    : mockClasses;

  return (
    <div className="card bg-warning-50 border-4 border-warning-200 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-warning-600 flex items-center gap-3">
          <span className="text-4xl animate-bounce-slow">⚠️</span>
          未完成交接儿童（{pendingChildren.length}人）
        </h3>
        <p className="text-lg text-warning-500">
          请尽快完成这些儿童的交接确认
        </p>
      </div>

      <div className="space-y-6">
        {classesToShow.map((cls) => {
          const classChildren = pendingChildren.filter((c) => c.classId === cls.id);
          if (classChildren.length === 0) return null;

          return (
            <div key={cls.id}>
              <h4
                className="text-xl font-bold mb-4 flex items-center gap-2"
                style={{ color: cls.color }}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: cls.color }}
                >
                  {cls.name.slice(0, 2)}
                </span>
                {cls.name}（{classChildren.length}人待确认）
              </h4>
              <div className="grid grid-cols-6 gap-4">
                {classChildren.map((child) => (
                  <ChildCard key={child.id} child={child} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
