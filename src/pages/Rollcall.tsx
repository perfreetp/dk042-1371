import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import RollcallClassSelect from "@/components/rollcall/RollcallClassSelect";
import ChildCard from "@/components/rollcall/ChildCard";
import PendingList from "@/components/rollcall/PendingList";
import { useRollcallStore } from "@/store/useRollcallStore";
import { useInspectionStore } from "@/store/useInspectionStore";
import { mockClasses } from "@/data/classes";
import { CHILD_STATUS_OPTIONS } from "@/types";
import { Check, ArrowRight, RotateCcw, Users } from "lucide-react";

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

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <PageHeader
        title="儿童点名核对"
        subtitle={`已完成 ${completedCount}/${totalCount} 名儿童`}
      />

      <div className="p-10 flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="card mb-8">
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
            <div className="flex gap-8 mt-6 justify-center">
              {CHILD_STATUS_OPTIONS.map((option) => {
                const count = children.filter(
                  (c) => c.status === option.value
                ).length;
                return (
                  <div key={option.value} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full ${option.color}`} />
                    <span className="text-xl text-gray-600">
                      {option.icon} {option.label}: 
                      <span className="font-bold text-navy-500 ml-1">{count}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {pendingChildren.length > 0 && <PendingList />}

          <div className="space-y-8">
            {classesToShow.map((cls) => {
              const classChildren = children.filter((c) => c.classId === cls.id);
              if (classChildren.length === 0) return null;
              const completedInClass = classChildren.filter(
                (c) => c.status !== "pending"
              ).length;

              return (
                <div key={cls.id} className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3
                      className="text-2xl font-bold flex items-center gap-3"
                      style={{ color: cls.color }}
                    >
                      <span
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: cls.color }}
                      >
                        {cls.name.slice(0, 2)}
                      </span>
                      {cls.name}
                    </h3>
                    <div className="flex items-center gap-3">
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

          <div className="mt-10 flex justify-center gap-6">
            <button
              onClick={() => {
                resetRollcall();
              }}
              className="btn-secondary flex items-center gap-3"
            >
              <RotateCcw className="w-6 h-6" />
              重新选择班级
            </button>
            {isRollcallComplete() && (
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
