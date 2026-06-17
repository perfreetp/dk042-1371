import { useInspectionStore } from "@/store/useInspectionStore";
import { useRollcallStore } from "@/store/useRollcallStore";
import { inspectionAreas } from "@/data/areas";
import { Check, X, AlertTriangle } from "lucide-react";

export default function StatusOverview() {
  const { record: inspectionRecord, isAllAreasChecked, getAllUncheckedAreas } =
    useInspectionStore();
  const {
    record: rollcallRecord,
    isRollcallComplete,
    getPendingChildren,
    getTotalCount,
    getCompletedCount,
  } = useRollcallStore();

  const inspectionPassed = inspectionRecord?.completed || isAllAreasChecked();
  const rollcallPassed =
    getTotalCount() > 0 && (rollcallRecord?.completed || isRollcallComplete());

  return (
    <div className="grid grid-cols-2 gap-8 mb-8">
      <div
        className={`card border-4 ${
          inspectionPassed ? "border-success-400" : "border-warning-400"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                inspectionPassed ? "bg-success-100" : "bg-warning-100"
              }`}
            >
              <span className="text-4xl">🔍</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-navy-500">离车检查</h3>
              <p className="text-lg text-gray-500">
                {inspectionRecord?.classIds.length ?? 0} 个班级 ·{" "}
                {inspectionAreas.length} 个检查区域
              </p>
            </div>
          </div>
          {inspectionPassed ? (
            <div className="bg-success-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2">
              <Check className="w-7 h-7" />
              <span className="text-xl font-bold">通过</span>
            </div>
          ) : (
            <div className="bg-warning-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-7 h-7" />
              <span className="text-xl font-bold">未完成</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {inspectionAreas.map((area) => {
            const checked =
              inspectionRecord?.areas.find((a) => a.areaId === area.id)
                ?.checked ?? false;
            return (
              <div
                key={area.id}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  checked ? "bg-success-50" : "bg-warning-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{area.icon}</span>
                  <span className="text-lg font-medium text-navy-500">
                    {area.name}
                  </span>
                </div>
                {checked ? (
                  <Check className="w-6 h-6 text-success-600" />
                ) : (
                  <X className="w-6 h-6 text-warning-500" />
                )}
              </div>
            );
          })}
        </div>

        {!inspectionPassed && (
          <div className="mt-6 bg-warning-100 text-warning-700 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">未检查区域：</p>
              <p className="text-lg">{getAllUncheckedAreas().join("、")}</p>
            </div>
          </div>
        )}
      </div>

      <div
        className={`card border-4 ${
          rollcallPassed ? "border-success-400" : "border-warning-400"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                rollcallPassed ? "bg-success-100" : "bg-warning-100"
              }`}
            >
              <span className="text-4xl">👧</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-navy-500">儿童点名</h3>
              <p className="text-lg text-gray-500">
                {getCompletedCount()}/{getTotalCount()} 名儿童完成交接
              </p>
            </div>
          </div>
          {rollcallPassed ? (
            <div className="bg-success-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2">
              <Check className="w-7 h-7" />
              <span className="text-xl font-bold">通过</span>
            </div>
          ) : (
            <div className="bg-warning-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-7 h-7" />
              <span className="text-xl font-bold">未完成</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-lg mb-2">
            <span className="text-gray-600">完成进度</span>
            <span className="font-bold text-navy-500">
              {getTotalCount() > 0
                ? Math.round((getCompletedCount() / getTotalCount()) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                rollcallPassed
                  ? "bg-gradient-to-r from-success-400 to-success-600"
                  : "bg-gradient-to-r from-warning-400 to-warning-600"
              }`}
              style={{
                width: `${
                  getTotalCount() > 0
                    ? (getCompletedCount() / getTotalCount()) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {!rollcallPassed && getPendingChildren().length > 0 && (
          <div className="bg-warning-50 rounded-xl p-4 max-h-56 overflow-auto">
            <p className="font-bold text-warning-700 mb-3">
              待确认儿童（{getPendingChildren().length}人）：
            </p>
            <div className="flex flex-wrap gap-2">
              {getPendingChildren().map((child) => (
                <span
                  key={child.id}
                  className="bg-white text-warning-700 px-4 py-2 rounded-lg text-lg font-medium shadow-sm"
                >
                  {child.avatar} {child.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {getTotalCount() === 0 && (
          <div className="bg-gray-100 text-gray-600 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <p>尚未进行点名，请先完成儿童点名核对</p>
          </div>
        )}
      </div>
    </div>
  );
}
