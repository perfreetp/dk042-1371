import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import ClassSelector from "@/components/inspection/ClassSelector";
import AreaGuide from "@/components/inspection/AreaGuide";
import NumberPad from "@/components/inspection/NumberPad";
import ItemChecker from "@/components/inspection/ItemChecker";
import WarningOverlay from "@/components/inspection/WarningOverlay";
import { useInspectionStore } from "@/store/useInspectionStore";
import { inspectionAreas } from "@/data/areas";
import { speak } from "@/utils/speech";
import { Check, ArrowRight, RotateCcw } from "lucide-react";

export default function Inspection() {
  const navigate = useNavigate();
  const {
    record,
    currentAreaIndex,
    confirmCurrentArea,
    goToNextArea,
    isAllAreasChecked,
    completeInspection,
    resetInspection,
    setWarningVisible,
  } = useInspectionStore();
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (record && !showComplete) {
      const currentArea = inspectionAreas[currentAreaIndex];
      setTimeout(() => {
        speak(`现在检查${currentArea.name}，${currentArea.description}`);
      }, 300);
    }
  }, [currentAreaIndex, record]);

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <PageHeader title="离车检查" subtitle="请先选择本趟应下车的班级" />
        <ClassSelector />
      </div>
    );
  }

  const handleConfirmAndNext = () => {
    confirmCurrentArea();
    speak("确认完成");

    if (currentAreaIndex < inspectionAreas.length - 1) {
      setTimeout(() => {
        goToNextArea();
      }, 500);
    }
  };

  const handleFinishCheck = () => {
    if (!isAllAreasChecked()) {
      setWarningVisible(true);
      return;
    }
    completeInspection();
    setShowComplete(true);
    speak("离车检查全部完成，确认无儿童滞留");
  };

  if (showComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <PageHeader title="离车检查完成" subtitle="所有区域已检查完毕" showBack={false} />
        <div className="flex-1 flex items-center justify-center p-10">
          <div className="text-center max-w-3xl">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-success-400 to-success-600 rounded-full flex items-center justify-center shadow-2xl mb-10 animate-bounce-slow">
              <span className="text-9xl">✅</span>
            </div>
            <h2 className="text-6xl font-black text-success-600 mb-6">
              离车检查完成！
            </h2>
            <p className="text-3xl text-gray-600 mb-4">
              所有 {inspectionAreas.length} 个区域已全部检查完毕
            </p>
            <p className="text-2xl text-gray-500 mb-12">
              确认校车内无儿童滞留，可以进行下一步操作
            </p>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="card bg-success-50 border-2 border-success-200">
                <p className="text-xl text-gray-500 mb-2">检查区域</p>
                <p className="text-5xl font-bold text-success-600">
                  {inspectionAreas.length}/{inspectionAreas.length}
                </p>
              </div>
              <div className="card bg-primary-50 border-2 border-primary-200">
                <p className="text-xl text-gray-500 mb-2">检查班级</p>
                <p className="text-5xl font-bold text-primary-600">
                  {record.classIds.length} 个
                </p>
              </div>
            </div>

            <div className="flex gap-6 justify-center flex-wrap">
              <button
                onClick={() => navigate("/inspection/detail")}
                className="btn-secondary flex items-center gap-3"
              >
                📋 查看检查详情
              </button>
              <button
                onClick={() => navigate("/rollcall")}
                className="btn-success flex items-center gap-3 text-2xl px-12 py-5"
              >
                前往儿童点名
                <ArrowRight className="w-8 h-8" />
              </button>
              <button
                onClick={() => {
                  resetInspection();
                  setShowComplete(false);
                }}
                className="btn-secondary flex items-center gap-3"
              >
                <RotateCcw className="w-6 h-6" />
                重新检查
              </button>
              <button
                onClick={() => navigate("/")}
                className="btn-secondary"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLastArea = currentAreaIndex === inspectionAreas.length - 1;
  const currentAreaChecked = record.areas[currentAreaIndex]?.checked;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <PageHeader
        title="离车检查"
        subtitle={`已完成 ${record.areas.filter((a) => a.checked).length}/${inspectionAreas.length} 个区域`}
      />
      <div className="flex-1 p-10 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <AreaGuide />
          <NumberPad />
          <ItemChecker />

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentAreaChecked && (
                <div className="bg-success-50 text-success-600 px-8 py-4 rounded-2xl flex items-center gap-3">
                  <Check className="w-8 h-8" />
                  <span className="text-2xl font-bold">本区域已确认</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {!isLastArea ? (
                <button
                  onClick={handleConfirmAndNext}
                  className="btn-primary flex items-center gap-3 text-2xl px-12 py-5"
                >
                  {currentAreaChecked ? "继续下一区域" : "确认并进入下一区域"}
                  <ArrowRight className="w-8 h-8" />
                </button>
              ) : (
                <button
                  onClick={handleFinishCheck}
                  className={`flex items-center gap-3 text-2xl px-12 py-5 rounded-2xl font-bold shadow-xl transition-all
                    ${isAllAreasChecked()
                      ? "bg-gradient-to-r from-success-500 to-teal-500 text-white hover:scale-105"
                      : "bg-warning-500 text-white hover:bg-warning-600 animate-pulse"
                    }`}
                >
                  {isAllAreasChecked() ? (
                    <>
                      <Check className="w-8 h-8" />
                      完成全部检查
                    </>
                  ) : (
                    "⚠️ 还有未检查区域"
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 card bg-gray-50">
            <h4 className="text-xl font-bold text-gray-600 mb-4">📋 检查进度一览</h4>
            <div className="grid grid-cols-7 gap-3">
              {inspectionAreas.map((area, idx) => {
                const result = record.areas.find((a) => a.areaId === area.id);
                const isChecked = result?.checked;
                const isCurrent = idx === currentAreaIndex;
                return (
                  <div
                    key={area.id}
                    className={`p-4 rounded-2xl text-center transition-all
                      ${isCurrent
                        ? "bg-primary-500 text-white shadow-xl scale-105"
                        : isChecked
                        ? "bg-success-100 text-success-700"
                        : "bg-white text-gray-500"
                      }`}
                  >
                    <p className="text-3xl mb-1">{area.icon}</p>
                    <p className="text-lg font-bold">{area.name}</p>
                    {isChecked && result && (
                      <p className="text-sm mt-1">
                        空座{result.emptySeats}
                        {result.leftoverItems.length > 0 && ` · 遗留${result.leftoverItems.length}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <WarningOverlay />
    </div>
  );
}
