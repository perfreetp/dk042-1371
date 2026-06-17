import { useState, useEffect } from "react";
import type { Child, ChildStatus } from "@/types";
import { CHILD_STATUS_OPTIONS } from "@/types";
import { useRollcallStore } from "@/store/useRollcallStore";
import { mockClasses } from "@/data/classes";
import { X } from "lucide-react";

interface ChildCardProps {
  child: Child;
}

export default function ChildCard({ child }: ChildCardProps) {
  const { setChildStatus } = useRollcallStore();
  const [showPicker, setShowPicker] = useState(false);

  const classInfo = mockClasses.find((c) => c.id === child.classId);
  const statusInfo = CHILD_STATUS_OPTIONS.find((s) => s.value === child.status);

  const getAvatarBg = () => {
    if (child.status === "pending") return "bg-gradient-to-br from-gray-200 to-gray-300";
    if (child.status === "picked_up") return "bg-gradient-to-br from-success-400 to-success-600";
    if (child.status === "in_class") return "bg-gradient-to-br from-primary-400 to-primary-600";
    return "bg-gradient-to-br from-gray-400 to-gray-500";
  };

  const handleSelectStatus = (status: ChildStatus) => {
    setChildStatus(child.id, status);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(true)}
        className={`w-full p-5 rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all
          hover:-translate-y-1 border-4 ${
            child.status === "pending"
              ? "border-gray-100"
              : child.status === "picked_up"
              ? "border-success-400"
              : child.status === "in_class"
              ? "border-primary-400"
              : "border-gray-400"
          }`}
      >
        <div className="relative">
          <div
            className={`w-full aspect-square rounded-2xl ${getAvatarBg()} 
              flex items-center justify-center mb-4 transition-all`}
          >
            <span className="text-6xl">{child.avatar}</span>
          </div>
          {statusInfo && (
            <div className={`absolute -top-2 -right-2 ${statusInfo.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1`}>
              <span>{statusInfo.icon}</span>
              <span>{statusInfo.label}</span>
            </div>
          )}
          {child.status === "pending" && (
            <div className="absolute -top-2 -right-2 bg-warning-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-lg font-bold">!</span>
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-navy-500 text-center">{child.name}</p>
        {classInfo && (
          <p
            className="text-lg text-center mt-1 font-medium"
            style={{ color: classInfo.color }}
          >
            {classInfo.name}
          </p>
        )}
      </button>

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in sm:items-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl ${getAvatarBg()} flex items-center justify-center`}>
                  <span className="text-4xl">{child.avatar}</span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-navy-500">{child.name}</p>
                  {classInfo && (
                    <p className="text-xl" style={{ color: classInfo.color }}>
                      {classInfo.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <X className="w-7 h-7 text-gray-500" />
              </button>
            </div>

            <p className="text-xl text-gray-500 mb-6 text-center">
              请选择该儿童的交接状态
            </p>

            <div className="space-y-4">
              {CHILD_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelectStatus(option.value)}
                  className={`w-full p-6 rounded-2xl flex items-center gap-5 transition-all hover:scale-[1.02]
                    ${option.color} text-white shadow-lg hover:shadow-xl`}
                >
                  <span className="text-4xl">{option.icon}</span>
                  <span className="text-2xl font-bold">{option.label}</span>
                </button>
              ))}
              {child.status !== "pending" && (
                <button
                  onClick={() => handleSelectStatus("pending")}
                  className="w-full p-6 rounded-2xl flex items-center gap-5 transition-all border-4 border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  <span className="text-4xl">↩️</span>
                  <span className="text-2xl font-bold">取消标记</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
