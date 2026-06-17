import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import { useInspectionStore } from "@/store/useInspectionStore";
import { inspectionAreas } from "@/data/areas";
import { mockClasses } from "@/data/classes";
import { LEFTOVER_ITEMS } from "@/types";
import { formatDateTime } from "@/utils/time";
import { ArrowLeft, FileText, AlertTriangle, Check, X } from "lucide-react";

export default function InspectionDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { record: currentRecord, historyRecords } = useInspectionStore();

  const targetRecord =
    id && historyRecords.length > 0
      ? historyRecords.find((r) => r.id === id) || currentRecord
      : currentRecord;

  if (!targetRecord) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <PageHeader title="检查记录详情" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">📋</p>
            <p className="text-3xl font-bold text-gray-500">暂无检查记录</p>
            <button
              onClick={() => navigate("/inspection")}
              className="mt-6 btn-primary"
            >
              返回检查
            </button>
          </div>
        </div>
      </div>
    );
  }

  const classNames = targetRecord.classIds
    .map((cid) => mockClasses.find((c) => c.id === cid)?.name)
    .filter(Boolean)
    .join("、");

  const areasWithLeftover = targetRecord.areas.filter(
    (a) => a.leftoverItems.length > 0
  );
  const totalLeftoverCount = targetRecord.areas.reduce(
    (sum, a) => sum + a.leftoverItems.length,
    0
  );
  const checkedCount = targetRecord.areas.filter((a) => a.checked).length;
  const totalEmptySeats = targetRecord.areas.reduce(
    (sum, a) => sum + a.emptySeats,
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <PageHeader
        title="离车检查记录详情"
        subtitle={`检查人：${targetRecord.inspectorName}`}
        extra={
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
        }
      />

      <div className="flex-1 p-10 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-4 gap-6">
            <div className="card bg-primary-50 border-2 border-primary-200">
              <p className="text-lg text-gray-500 mb-2">检查班级</p>
              <p className="text-3xl font-bold text-primary-600">
                {targetRecord.classIds.length} 个班</p>
              <p className="text-lg text-gray-600 mt-1">{classNames}</p>
            </div>
            <div className="card bg-success-50 border-2 border-success-200">
              <p className="text-lg text-gray-500 mb-2">检查区域</p>
              <p className="text-3xl font-bold text-success-600">
                {checkedCount}/{inspectionAreas.length}
              </p>
              <p className="text-lg text-gray-600 mt-1">
                {targetRecord.completed ? "全部完成" : "未完成"}
              </p>
            </div>
            <div className="card bg-navy-50 border-2 border-navy-200">
              <p className="text-lg text-gray-500 mb-2">空座总数</p>
              <p className="text-3xl font-bold text-navy-600">{totalEmptySeats} 个</p>
              <p className="text-lg text-gray-600 mt-1">全车清点</p>
            </div>
            <div
              className={`card border-2 ${
                areasWithLeftover.length > 0
                  ? "bg-warning-50 border-warning-200"
                  : "bg-success-50 border-success-200"
              }`}
            >
              <p className="text-lg text-gray-500 mb-2">遗留物品</p>
              <p
                className={`text-3xl font-bold ${
                  areasWithLeftover.length > 0
                  ? "text-warning-600"
                  : "text-success-600"
                }`}
              >
                {totalLeftoverCount} 件
              </p>
              <p className="text-lg text-gray-600 mt-1">
                {areasWithLeftover.length > 0
                  ? `${areasWithLeftover.length} 个区域有遗留`
                  : "无遗留物品"}
              </p>
            </div>
          </div>

          <div className="card bg-navy-50 border-4 border-navy-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-navy-500 flex items-center gap-3">
                <FileText className="w-8 h-8" />
                基础信息
              </h3>
              {targetRecord.completed && (
                <div className="bg-success-500 text-white px-6 py-2 rounded-2xl flex items-center gap-2">
                  <Check className="w-6 h-6" />
                  <span className="font-bold text-xl">检查通过</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-6 text-lg">
              <div>
                <span className="text-gray-500">记录编号：</span>
                <span className="font-bold text-navy-500">{targetRecord.id}</span>
              </div>
              <div>
                <span className="text-gray-500">开始时间：</span>
                <span className="font-bold text-navy-500">
                  {formatDateTime(new Date(targetRecord.createdAt))}
                </span>
              </div>
              {targetRecord.completedAt && (
                <div>
                  <span className="text-gray-500">完成时间：</span>
                  <span className="font-bold text-navy-500">
                    {formatDateTime(new Date(targetRecord.completedAt))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {areasWithLeftover.length > 0 && (
            <div className="card bg-warning-50 border-4 border-warning-200">
              <h3 className="text-2xl font-bold text-warning-600 flex items-center gap-3 mb-6">
                <AlertTriangle className="w-8 h-8" />
                遗留物品汇总（需处理）
              </h3>
              <div className="space-y-4">
                {areasWithLeftover.map((areaResult) => {
                  const areaInfo = inspectionAreas.find(
                    (a) => a.id === areaResult.areaId
                  );
                  return (
                    <div
                      key={areaResult.areaId}
                      className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl">{areaInfo?.icon}</span>
                        <div>
                          <p className="text-xl font-bold text-navy-500">
                            {areaInfo?.name}
                          </p>
                          <p className="text-lg text-gray-500">
                            {areaInfo?.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {areaResult.leftoverItems.map((itemId) => {
                          const item = LEFTOVER_ITEMS.find(
                            (i) => i.id === itemId
                          );
                          return (
                            <div
                              key={itemId}
                              className="bg-warning-100 text-warning-700 px-5 py-3 rounded-xl flex items-center gap-2"
                            >
                              <span className="text-2xl">{item?.icon}</span>
                              <span className="font-bold text-lg">
                                {item?.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-2xl font-bold text-navy-500 flex items-center gap-3 mb-6">
              <span className="text-3xl">📋</span>
              各区域检查明细
            </h3>
            <div className="space-y-3">
              {inspectionAreas.map((area, idx) => {
                const result = targetRecord.areas.find(
                  (a) => a.areaId === area.id
                );
                return (
                  <div
                    key={area.id}
                    className={`p-5 rounded-2xl border-2 ${
                      result?.checked
                        ? "bg-success-50 border-success-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            result?.checked
                              ? "bg-success-500"
                              : "bg-gray-300"
                          } text-white font-bold text-xl`}
                        >
                          {result?.checked ? (
                            <Check className="w-7 h-7" />
                          ) : (
                            <X className="w-7 h-7" />
                          )}
                        </div>
                        <span className="text-3xl">{area.icon}</span>
                        <div>
                          <p className="text-xl font-bold text-navy-500">
                            {idx + 1}. {area.name}
                          </p>
                          <p className="text-lg text-gray-500">
                            {area.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-lg text-gray-500">空座</p>
                          <p className="text-2xl font-bold text-primary-600">
                            {result?.emptySeats ?? 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg text-gray-500">遗留</p>
                          <p
                            className={`text-2xl font-bold ${
                              (result?.leftoverItems.length ?? 0) > 0
                                ? "text-warning-600"
                                : "text-success-600"
                            }`}
                          >
                            {result?.leftoverItems.length ?? 0} 件
                          </p>
                        </div>
                        <div className="text-right min-w-[160px]">
                          <p className="text-lg text-gray-500">检查人</p>
                          <p className="text-xl font-bold text-navy-500">
                            {result?.checked
                              ? result.inspectorName || targetRecord.inspectorName
                              : "—"}
                          </p>
                        </div>
                        <div className="text-right min-w-[180px]">
                          <p className="text-lg text-gray-500">确认时间</p>
                          <p className="text-lg font-bold text-navy-500">
                            {result?.checkedAt
                              ? formatDateTime(new Date(result.checkedAt))
                              : "未检查"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {result && result.leftoverItems.length > 0 && (
                      <div className="mt-4 ml-16 flex flex-wrap gap-2">
                        {result.leftoverItems.map((itemId) => {
                          const item = LEFTOVER_ITEMS.find(
                            (i) => i.id === itemId
                          );
                          return (
                            <span
                              key={itemId}
                              className="bg-warning-100 text-warning-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1"
                            >
                              <span>{item?.icon}</span>
                              {item?.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {historyRecords.length > 1 && (
            <div className="card bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-600 mb-6">
                📚 历史检查记录（最近{Math.min(historyRecords.length, 10)}条）
              </h3>
              <div className="space-y-3 max-h-96 overflow-auto">
                {historyRecords.slice(0, 10).map((rec, idx) => (
                  <button
                    key={rec.id}
                    onClick={() => navigate(`/inspection/detail/${rec.id}`)}
                    disabled={rec.id === targetRecord.id}
                    className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all ${
                      rec.id === targetRecord.id
                        ? "bg-primary-50 border-2 border-primary-300"
                        : "bg-white hover:bg-primary-50 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                          rec.completed
                            ? "bg-success-500"
                            : "bg-warning-500"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-bold text-navy-500">
                          {formatDateTime(new Date(rec.createdAt))}
                        </p>
                        <p className="text-lg text-gray-500">
                          {rec.classIds.length}个班级 · {rec.areas.filter((a) => a.checked).length}/{inspectionAreas.length}区域
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {rec.completed ? (
                        <span className="bg-success-100 text-success-700 px-4 py-2 rounded-xl font-bold">
                          已完成
                        </span>
                      ) : (
                        <span className="bg-warning-100 text-warning-700 px-4 py-2 rounded-xl font-bold">
                          未完成
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
