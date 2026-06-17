import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import StatusOverview from "@/components/review/StatusOverview";
import SignaturePad from "@/components/review/SignaturePad";
import { useReviewStore } from "@/store/useReviewStore";
import { useInspectionStore } from "@/store/useInspectionStore";
import { useRollcallStore } from "@/store/useRollcallStore";
import { mockBus } from "@/data/bus";
import { formatDateTime } from "@/utils/time";
import { Check, Home, ShieldCheck, User } from "lucide-react";

export default function Review() {
  const navigate = useNavigate();
  const { submitReview, currentRecord, signature, setSignature, reviewerName, setReviewerName } =
    useReviewStore();
  const { isAllAreasChecked } = useInspectionStore();
  const { isRollcallComplete, getTotalCount } = useRollcallStore();

  const [step, setStep] = useState<"status" | "signature" | "complete">(
    currentRecord ? "complete" : "status"
  );

  const inspectionPassed = isAllAreasChecked();
  const rollcallPassed = getTotalCount() > 0 && isRollcallComplete();
  const allPassed = inspectionPassed && rollcallPassed;

  const handleSignatureConfirm = (dataUrl: string) => {
    setSignature(dataUrl);
  };

  const handleSubmit = () => {
    if (!signature || !reviewerName.trim()) return;
    submitReview(inspectionPassed, rollcallPassed);
    setStep("complete");
  };

  if (step === "complete" && currentRecord) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <PageHeader
          title="放行确认完成"
          subtitle="安全闭环已完成"
          showBack={false}
        />
        <div className="flex-1 flex items-center justify-center p-10">
          <div className="text-center max-w-3xl">
            <div
              className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center shadow-2xl mb-10 animate-bounce-slow ${
                currentRecord.passed
                  ? "bg-gradient-to-br from-success-400 to-teal-500"
                  : "bg-gradient-to-br from-warning-400 to-orange-500"
              }`}
            >
              {currentRecord.passed ? (
                <ShieldCheck className="w-24 h-24 text-white" />
              ) : (
                <span className="text-7xl">⚠️</span>
              )}
            </div>
            <h2
              className={`text-6xl font-black mb-6 ${
                currentRecord.passed ? "text-success-600" : "text-warning-600"
              }`}
            >
              {currentRecord.passed ? "已放行！" : "需进一步确认"}
            </h2>
            <p className="text-2xl text-gray-600 mb-12">
              {currentRecord.passed
                ? "所有检查项目已通过，校车可以驶离园区"
                : "部分检查项目未完成，请联系随车老师确认"}
            </p>

            <div className="card text-left mb-10">
              <h3 className="text-2xl font-bold text-navy-500 mb-6 flex items-center gap-3">
                <span className="text-3xl">📋</span>
                放行记录
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <p className="text-lg text-gray-500 mb-1">车牌号</p>
                  <p className="text-2xl font-bold text-navy-500">
                    {mockBus.plateNumber}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <p className="text-lg text-gray-500 mb-1">放行时间</p>
                  <p className="text-2xl font-bold text-navy-500">
                    {formatDateTime(new Date(currentRecord.createdAt))}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <p className="text-lg text-gray-500 mb-1">复核人员</p>
                  <p className="text-2xl font-bold text-navy-500">
                    {currentRecord.reviewerName}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <p className="text-lg text-gray-500 mb-1">复核结果</p>
                  <p
                    className={`text-2xl font-bold ${
                      currentRecord.passed ? "text-success-600" : "text-warning-600"
                    }`}
                  >
                    {currentRecord.passed ? "通过放行" : "待确认"}
                  </p>
                </div>
              </div>

              {currentRecord.signature && (
                <div className="mt-6 bg-gray-50 p-6 rounded-2xl">
                  <p className="text-lg text-gray-500 mb-3">签名确认</p>
                  <img
                    src={currentRecord.signature}
                    alt="签名"
                    className="max-h-32 border border-gray-200 rounded-xl bg-white p-4"
                  />
                </div>
              )}

              <div className="mt-6 flex gap-4">
                <div
                  className={`flex-1 p-4 rounded-xl flex items-center gap-3 ${
                    currentRecord.inspectionPassed
                      ? "bg-success-50 text-success-700"
                      : "bg-warning-50 text-warning-700"
                  }`}
                >
                  {currentRecord.inspectionPassed ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span>⚠️</span>
                  )}
                  <span className="font-bold text-lg">
                    离车检查{currentRecord.inspectionPassed ? "已完成" : "未完成"}
                  </span>
                </div>
                <div
                  className={`flex-1 p-4 rounded-xl flex items-center gap-3 ${
                    currentRecord.rollcallPassed
                      ? "bg-success-50 text-success-700"
                      : "bg-warning-50 text-warning-700"
                  }`}
                >
                  {currentRecord.rollcallPassed ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span>⚠️</span>
                  )}
                  <span className="font-bold text-lg">
                    儿童点名{currentRecord.rollcallPassed ? "已完成" : "未完成"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-6 justify-center">
              <button
                onClick={() => navigate("/")}
                className="btn-primary flex items-center gap-3 text-2xl px-12 py-5"
              >
                <Home className="w-8 h-8" />
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "signature") {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <PageHeader
          title="签名确认"
          subtitle="请保安或值班园长签名确认后放行"
        />
        <div className="flex-1 p-10">
          <div className="max-w-4xl mx-auto">
            <div className="card bg-navy-50 border-4 border-navy-200 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-navy-500 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-navy-500">
                      复核人员信息
                    </h3>
                    <p className="text-lg text-gray-500">
                      请填写您的姓名并签名确认
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg text-gray-500">车辆</p>
                  <p className="text-2xl font-bold text-navy-500">
                    {mockBus.plateNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="card mb-8">
              <h4 className="text-2xl font-bold text-navy-500 mb-6 flex items-center gap-3">
                <User className="w-8 h-8" />
                请输入复核人员姓名
              </h4>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="请输入姓名（如：王园长、李保安）"
                className="w-full px-8 py-5 text-2xl border-4 border-gray-200 rounded-2xl focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            <SignaturePad onConfirm={handleSignatureConfirm} />

            <div className="mt-10 flex justify-center gap-6">
              <button
                onClick={() => setStep("status")}
                className="btn-secondary"
              >
                返回查看状态
              </button>
              <button
                onClick={handleSubmit}
                disabled={!signature || !reviewerName.trim()}
                className={`px-16 py-6 rounded-3xl text-3xl font-bold text-white shadow-2xl transition-all flex items-center gap-4
                  ${signature && reviewerName.trim()
                    ? allPassed
                      ? "bg-gradient-to-r from-success-500 to-teal-500 hover:scale-105"
                      : "bg-gradient-to-r from-warning-500 to-orange-500 hover:scale-105"
                    : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                <ShieldCheck className="w-10 h-10" />
                {allPassed ? "确认放行" : "确认提交"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <PageHeader title="园门口复核" subtitle="保安/值班园长复核确认" />
      <div className="flex-1 p-10 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div
            className={`card mb-8 border-4 ${
              allPassed ? "border-success-400" : "border-warning-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div
                  className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
                    allPassed ? "bg-success-100" : "bg-warning-100"
                  }`}
                >
                  {allPassed ? (
                    <span className="text-5xl animate-bounce-slow">✅</span>
                  ) : (
                    <span className="text-5xl animate-pulse">⚠️</span>
                  )}
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-navy-500 mb-2">
                    {allPassed ? "所有检查已通过" : "部分检查未完成"}
                  </h2>
                  <p className="text-xl text-gray-500">
                    车牌号：{mockBus.plateNumber} · 司机：{mockBus.driverName}
                  </p>
                </div>
              </div>
              {!allPassed && (
                <div className="bg-warning-500 text-white px-8 py-4 rounded-2xl animate-pulse">
                  <p className="text-xl font-bold">请联系随车老师确认</p>
                </div>
              )}
            </div>
          </div>

          <StatusOverview />

          <div className="flex justify-center mt-10">
            <button
              onClick={() => setStep("signature")}
              className={`px-20 py-7 rounded-3xl text-3xl font-bold text-white shadow-2xl transition-all flex items-center gap-4
                ${allPassed
                  ? "bg-gradient-to-r from-navy-500 to-indigo-600 hover:scale-105"
                  : "bg-gradient-to-r from-warning-500 to-orange-500 hover:scale-105"
                }`}
            >
              <ShieldCheck className="w-10 h-10" />
              {allPassed ? "前往签名放行" : "前往签名确认"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
