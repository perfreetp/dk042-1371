import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import RollcallClassSelect from "@/components/rollcall/RollcallClassSelect";
import ChildCard from "@/components/rollcall/ChildCard";
import PendingList from "@/components/rollcall/PendingList";
import { useRollcallStore } from "@/store/useRollcallStore";
import { useInspectionStore } from "@/store/useInspectionStore";
import { mockClasses } from "@/data/classes";
import { CHILD_STATUS_OPTIONS, type ChildStatus } from "@/types";
import { Check, ArrowRight, RotateCcw, Users, Filter, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

type StatusFilter = "all" | ChildStatus;

export default function Rollcall() {
  const navigate = useNavigate();
  const {
    record,
    getFilteredChildren,
    getPendingChildren,
    getCompletedCount,
    getTotalCount,
    isRollcallComplete,
    completeRollcall,
    resetRollcall,
  } = useRollcallStore();
  const { selectedClassIds: inspectionClasses } = useInspectionStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [focusClassId, setFocusClassId] = useState<string | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <PageHeader title="儿童点名" subtitle="请选择要点名核对的班级" />
        <RollcallClassSelect />
      </div>
    );
  }

  const children = getFilteredChildren();
  const pendingChildren = getPendingChildren();
  const totalCount = getTotalCount();
  const completedCount = getCompletedCount();
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isRollcallComplete() && record.completed) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <PageHeader title="点名完成" subtitle="所有儿童已完成交接确认" showBack={false} />
        <div className="flex-1 flex items-center justify-center p-10">
          <div className="text-center max-w-3xl">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-success-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl mb-10 animate-bounce-slow">
              <Users className="w-24 h-24 text-white" />
            </div>
            <h2 className="text-6xl font-black text-success-600 mb-6">
              点名核对完成！
            </h2>
            <p className="text-3xl text-gray-600 mb-4">
              所有 {totalCount} 名儿童已完成交接确认
            </p>
            <p className="text-2xl text-gray-500 mb-12">
              可以前往园门口复核，等待保安/园长签名放行
            </p>

            <div className="grid grid-cols-3 gap-6 mb-12">
              {CHILD_STATUS_OPTIONS.map((option) => {
                const count = children.filter(
                  (c) => c.status === option.value
                ).length;
                return (
                  <div
                    key={option.value}
                    className={`card ${option.color} text-white`}
                  >
                    <p className="text-4xl mb-2">{option.icon}</p>
                    <p className="text-xl opacity-90 mb-1">{option.label}</p>
                    <p className="text-5xl font-black">{count}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-6 justify-center">
              <button
                onClick={() => navigate("/review")}
                className="btn-success flex items-center gap-3 text-2xl px-12 py-5"
              >
                前往园门口复核
                <ArrowRight className="w-8 h-8" />
              </button>
              <button
                onClick={() => {
                  resetRollcall();
                }}
                className="btn-secondary flex items-center gap-3"
              >
                <RotateCcw className="w-6 h-6" />
                重新点名
              </button>
              <button onClick={() => navigate("/")} className="btn-secondary">
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const classesToShow = record.classIds.length > 0
    ? mockClasses.filter((c) => record.classIds.includes(c.id))
    : mockClasses;

  const filterOptions: { value: StatusFilter; label: string; icon: string; count: number }[] = [
    { value: "all", label: "全部", icon: "👥", count: children.length },
    { value: "pending", label: "未交接", icon: "⏳", count: pendingChildren.length },
    ...CHILD_STATUS_OPTIONS.map((opt) => ({
      value: opt.value as ChildStatus,
      label: opt.label,
      icon: opt.icon,
      count: children.filter((c) => c.status === opt.value).length,
    })),
  ];

  const classQuickStats = useMemo(() => {
    return classesToShow.map((cls) => {
      const classKids = children.filter((c) => c.classId === cls.id);
      const pending = classKids.filter((c) => c.status === "pending").length;
      return { ...cls, total: classKids.length, pending };
    });
  }, [children, classesToShow]);

  const displayChildren = useMemo(() => {
    let result = children;
    if (focusClassId) {
      result = result.filter((c) => c.classId === focusClassId);
    }
    if (showPendingOnly) {
      result = result.filter((c) => c.status === "pending");
    } else if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }
    return result;
  }, [children, focusClassId, statusFilter, showPendingOnly]);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <PageHeader
        title="儿童点名核对"
        subtitle={`已完成 ${completedCount}/${totalCount} 名儿童`}
      />

      <div className="p-8 flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-navy-500">点名进度</h3>
              <p className="text-3xl font-bold text-success-600">
                {Math.round(progress)}%
              </p>
            </div>
            <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success-400 to-success-600 transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="card mb-6 bg-primary-50/50 border-2 border-primary-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-primary-700 flex items-center gap-2">
                <Filter className="w-6 h-6" />
                快速筛选
              </h4>
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setFocusClassId(null);
                  setShowPendingOnly(false);
                }}
                className="text-lg text-primary-600 font-medium hover:underline"
              >
                重置筛选
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500 mb-3 font-medium">按状态筛选：</p>
                <div className="flex flex-wrap gap-3">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setShowPendingOnly(opt.value === "pending");
                      }}
                      className={`px-6 py-3 rounded-2xl text-xl font-bold transition-all flex items-center gap-2
                        ${(statusFilter === opt.value || (showPendingOnly && opt.value === "pending"))
                          ? "bg-primary-500 text-white shadow-lg scale-105"
                          : "bg-white text-navy-500 hover:bg-primary-100 border-2 border-gray-200"
                        }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      {opt.label}
                      <span
                        className={`ml-1 px-3 py-1 rounded-full text-lg ${
                          (statusFilter === opt.value || (showPendingOnly && opt.value === "pending"))
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {opt.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3 font-medium">按班级查看（点击查看未完成）：</p>
                <div className="flex flex-wrap gap-3">
                  {classQuickStats.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setFocusClassId(focusClassId === cls.id ? null : cls.id);
                        setShowPendingOnly(true);
                      }}
                      className={`px-5 py-3 rounded-2xl text-lg font-bold transition-all flex items-center gap-3 border-2
                        ${focusClassId === cls.id
                          ? "bg-white shadow-lg scale-105"
                          : "bg-white/70 hover:bg-white"
                        }`}
                      style={{
                        borderColor: focusClassId === cls.id ? cls.color : "transparent",
                      }}
                    >
                      <span
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base font-bold"
                        style={{ backgroundColor: cls.color }}
                      >
                        {cls.name.slice(0, 2)}
                      </span>
                      <span style={{ color: cls.color }}>{cls.name}</span>
                      <span className={`px-3 py-1 rounded-xl text-sm font-bold ${
                        cls.pending > 0
                          ? "bg-warning-100 text-warning-700"
                          : "bg-success-100 text-success-700"
                      }`}>
                        {cls.pending > 0 ? `剩${cls.pending}` : "已完成"}
                      </span>
                      {focusClassId === cls.id ? (
                        <ChevronUp className="w-5 h-5" style={{ color: cls.color }} />
                      ) : (
                        <ChevronDown className="w-5 h-5" style={{ color: cls.color }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {(statusFilter !== "all" || focusClassId || showPendingOnly) && (
              <div className="mt-5 p-4 bg-white rounded-2xl flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-primary-500 flex-shrink-0" />
                <p className="text-lg text-navy-500">
                  当前筛选结果：共显示
                  <span className="font-bold text-2xl text-primary-600 mx-2">{displayChildren.length}</span>
                  名儿童
                  {focusClassId && (
                    <>
                      ，班级：
                      <span className="font-bold mx-1">
                        {classQuickStats.find((c) => c.id === focusClassId)?.name}
                      </span>
                    </>
                  )}
                  {showPendingOnly && <span className="font-bold text-warning-600 mx-1">· 仅未交接</span>}
                </p>
              </div>
            )}
          </div>

          {pendingChildren.length > 0 && !showPendingOnly && statusFilter === "all" && !focusClassId && (
            <PendingList />
          )}

          {focusClassId || statusFilter !== "all" || showPendingOnly ? (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-navy-500">
                  {focusClassId
                    ? `${classQuickStats.find((c) => c.id === focusClassId)?.name} - `
                    : ""}
                  {showPendingOnly
                    ? "未完成交接儿童"
                    : statusFilter === "all"
                    ? "筛选结果"
                    : `${filterOptions.find((f) => f.value === statusFilter)?.label}儿童`}
                </h3>
                <span className="text-xl text-gray-500">
                  共 {displayChildren.length} 人
                </span>
              </div>
              {displayChildren.length > 0 ? (
                <div className="grid grid-cols-6 gap-4">
                  {displayChildren.map((child) => (
                    <ChildCard key={child.id} child={child} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-6xl mb-4">🎉</p>
                  <p className="text-2xl font-bold text-success-600">
                    已全部完成！
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {classesToShow.map((cls) => {
                const classChildren = displayChildren.filter(
                  (c) => c.classId === cls.id
                );
                if (classChildren.length === 0) return null;
                const completedInClass = classChildren.filter(
                  (c) => c.status !== "pending"
                ).length;
                const pendingInClass = classChildren.length - completedInClass;

                return (
                  <div key={cls.id} className="card">
                    <div className="flex items-center justify-between mb-5">
                      <button
                        onClick={() => {
                          setFocusClassId(cls.id);
                          setShowPendingOnly(true);
                        }}
                        className="text-2xl font-bold flex items-center gap-3 hover:opacity-80 transition-opacity"
                        style={{ color: cls.color }}
                      >
                        <span
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                          style={{ backgroundColor: cls.color }}
                        >
                          {cls.name.slice(0, 2)}
                        </span>
                        {cls.name}
                      </button>
                      <div className="flex items-center gap-3">
                        {pendingInClass > 0 && (
                          <button
                            onClick={() => {
                              setFocusClassId(cls.id);
                              setShowPendingOnly(true);
                            }}
                            className="bg-warning-100 text-warning-700 px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-warning-200 transition-colors"
                          >
                            <AlertCircle className="w-5 h-5" />
                            查看未完成 ({pendingInClass})
                          </button>
                        )}
                        {completedInClass === classChildren.length && (
                          <div className="bg-success-50 text-success-600 px-5 py-2 rounded-xl flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            <span className="font-bold">全部完成</span>
                          </div>
                        )}
                        <span className="text-xl text-gray-500">
                          {completedInClass}/{classChildren.length}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4">
                      {classChildren.map((child) => (
                        <ChildCard key={child.id} child={child} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-center gap-6 flex-wrap">
            <button
              onClick={() => {
                resetRollcall();
              }}
              className="btn-secondary flex items-center gap-3"
            >
              <RotateCcw className="w-6 h-6" />
              重新选择班级
            </button>
            {isRollcallComplete() && !record.completed && (
              <button
                onClick={() => completeRollcall()}
                className="btn-success flex items-center gap-3 text-2xl px-12 py-5"
              >
                <Check className="w-8 h-8" />
                确认完成点名
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
