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
import { formatTime } from "@/utils/time";
import {
  Check,
  Home,
  ShieldCheck,
  User,
  FileText,
  AlertTriangle,
  Clock,
  XCircle,
  CheckCircle2,
  ArrowRight,
  ClipboardCheck,
  Users,
  ChevronRight,
} from "lucide-react";
import type { ReviewRecord } from "@/types";

type Step = "status" | "signature" | "result";

export default function Review() {
  const navigate = useNavigate();
  const {
    submitReview,
    currentRecord: lastReviewResult,
    signature,
    setSignature,
    reviewerName,
    setReviewerName,
    records,
  } = useReviewStore();
  const {
    isAllAreasChecked,
    historyRecords: inspectionHistory,
    record: inspectionRecord,
  } = useInspectionStore();
  const {
    isRollcallComplete,
    getTotalCount,
    historyRecords: rollcallHistory,
    record: rollcallRecord,
  } = useRollcallStore();

  const [step, setStep] = useState<Step>(lastReviewResult ? "result" : "status");
  const [localResult, setLocalResult] = useState<ReviewRecord | null>(
    lastReviewResult || null
  );

  const inspectionPassed = isAllAreasChecked();
  const rollcallPassed = getTotalCount() > 0 && isRollcallComplete();
  const allPassed = inspectionPassed && rollcallPassed;

  const handleSignatureConfirm = (dataUrl: string) => {
    setSignature(dataUrl);
  };

  const handleSubmit = () => {
    if (!signature || !reviewerName.trim()) return;

    const mode = allPassed ? "release" : "signature_only";
    const result = submitReview(inspectionPassed, rollcallPassed, mode);
    if (result) {
      setLocalResult(result);
      setStep("result");
    }
  };

  const modeLabel = (mode: string) =>
    mode === "release" ? "正式放行" : "签名留痕";
  const modeClass = (mode: string) =>
    mode === "release"
      ? "bg-success-500 text-white"
      : "bg-warning-500 text-white";

  if (step === "result" && localResult) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <PageHeader
          title={localResult.passed ? "已正式放行" : "处理结果记录"}
          subtitle={localResult.passed ? "安全闭环完成" : "请联系随车老师完成剩余检查"}
          showBack={false}
        />
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="text-center max-w-4xl w-full">
            <div
              className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center shadow-2xl mb-8 animate-bounce-slow ${
                localResult.passed
                  ? "bg-gradient-to-br from-success-400 to-teal-500"
                  : "bg-gradient-to-br from-warning-400 to-orange-500"
              }`}
            >
              {localResult.passed ? (
                <ShieldCheck className="w-20 h-20 text-white" />
              ) : (
                <FileText className="w-20 h-20 text-white" />
              )}
            </div>
            <h2
              className={`text-6xl font-black mb-4 ${
                localResult.passed ? "text-success-600" : "text-warning-600"
              }`}
            >
              {localResult.passed ? "✓ 已放行" : "已签名留痕"}
            </h2>
            <p className="text-2xl text-gray-600 mb-8">
              {localResult.passed
                ? "所有检查项目已通过，校车可以驶离园区"
                : "部分项目未完成，已记录签名，请联系随车老师处理"}
            </p>

            <div className={`card text-left mb-8 ${
              localResult.passed
                ? "border-4 border-success-300"
                : "border-4 border-warning-300"
            }`}>
              <h3 className="text-2xl font-bold text-navy-500 mb-6 flex items-center gap-3">
                <span className="text-3xl">📋</span>
                处理记录
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <p className="text-lg text-gray-500 mb-1">车牌号</p>
                  <p className="text-2xl font-bold text-navy-500">
                    {mockBus.plateNumber}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <p className="text-lg text-gray-500 mb-1">处理方式</p>
                  <p className="text-2xl">
                    <span
                      className={`px-4 py-1 rounded-xl font-bold ${modeClass(
                        localResult.mode
                      )}`}
                    >
                      {modeLabel(localResult.mode)}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <p className="text-lg text-gray-500 mb-1">复核人员</p>
                  <p className="text-2xl font-bold text-navy-500">
                    {localResult.reviewerName}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <p className="text-lg text-gray-500 mb-1">
                    {localResult.passed ? "放行时间" : "签名时间"}
                  </p>
                  <p className="text-2xl font-bold text-navy-500">
                    {formatDateTime(
                      new Date(localResult.releasedAt || localResult.createdAt)
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-5">
                <div
                  className={`flex-1 p-4 rounded-2xl flex items-center gap-3 ${
                    localResult.inspectionPassed
                      ? "bg-success-50 text-success-700"
                      : "bg-warning-50 text-warning-700"
                  }`}
                >
                  {localResult.inspectionPassed ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                  <span className="font-bold text-lg">
                    离车检查{localResult.inspectionPassed ? "已完成" : "未完成"}
                  </span>
                </div>
                <div
                  className={`flex-1 p-4 rounded-2xl flex items-center gap-3 ${
                    localResult.rollcallPassed
                      ? "bg-success-50 text-success-700"
                      : "bg-warning-50 text-warning-700"
                  }`}
                >
                  {localResult.rollcallPassed ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                  <span className="font-bold text-lg">
                    儿童点名{localResult.rollcallPassed ? "已完成" : "未完成"}
                  </span>
                </div>
              </div>

              {localResult.signature && (
                <div className="mt-6 bg-gray-50 p-5 rounded-2xl">
                  <p className="text-lg text-gray-500 mb-3">签名确认</p>
                  <img
                    src={localResult.signature}
                    alt="签名"
                    className="max-h-28 border border-gray-200 rounded-xl bg-white p-3"
                  />
                </div>
              )}
            </div>

            {!localResult.passed && (
              <div className="card bg-warning-50 border-2 border-warning-300 mb-8 text-left">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-10 h-10 text-warning-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold text-warning-700 mb-2">
                      ⚠️ 重要：此记录仅为签名留痕，校车未正式放行！
                    </h4>
                    <ul className="text-lg text-warning-700 space-y-1 list-disc ml-5">
                      {!localResult.inspectionPassed && (
                        <li>离车检查未全部完成，可能存在未检查区域</li>
                      )}
                      {!localResult.rollcallPassed && (
                        <li>儿童点名未完成，仍有儿童待交接</li>
                      )}
                    </ul>
                    <p className="text-warning-700 mt-3 font-medium">
                      请立即联系随车老师处理，完成所有检查后再进行正式放行。
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-6 justify-center flex-wrap">
              <button
                onClick={() => {
                  setStep("status");
                  setLocalResult(null);
                }}
                className="btn-secondary flex items-center gap-3"
              >
                📋 再次复核
              </button>
              {inspectionHistory.length > 0 && (
                <button
                  onClick={() => navigate("/inspection/detail")}
                  className="btn-secondary flex items-center gap-3"
                >
                  📄 查看清车记录
                </button>
              )}
              <button
                onClick={() => navigate("/")}
                className="btn-primary flex items-center gap-3 text-2xl px-10 py-5"
              >
                <Home className="w-7 h-7" />
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
          subtitle={
            allPassed
              ? "保安或值班园长签名后正式放行"
              : "检查未全部完成，签名仅作留痕记录"
          }
        />
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div
              className={`card mb-6 border-4 ${
                allPassed ? "border-success-300" : "border-warning-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                      allPassed ? "bg-success-100" : "bg-warning-100"
                    }`}
                  >
                    {allPassed ? (
                      <ShieldCheck className="w-12 h-12 text-success-600" />
                    ) : (
                      <AlertTriangle className="w-12 h-12 text-warning-600" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-bold ${
                        allPassed ? "text-success-700" : "text-warning-700"
                      }`}
                    >
                      {allPassed ? "✅ 所有检查通过，可以正式放行" : "⚠️ 检查项目未全部完成"}
                    </h3>
                    <p className="text-lg text-gray-600 mt-1">
                      {allPassed
                        ? "离车检查和点名都已完成，请签名确认后放行校车"
                        : "签名后仅记录签名留痕，不可正式放行校车"}
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

            <div className="card mb-6">
              <h4 className="text-2xl font-bold text-navy-500 mb-5 flex items-center gap-3">
                <User className="w-7 h-7" />
                请输入复核人员姓名
              </h4>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="请输入姓名（如：王园长、李保安）"
                className="w-full px-7 py-5 text-2xl border-4 border-gray-200 rounded-2xl focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            <SignaturePad onConfirm={handleSignatureConfirm} />

            <div className="mt-8 flex justify-center gap-6 flex-wrap">
              <button
                onClick={() => setStep("status")}
                className="btn-secondary"
              >
                ← 返回查看状态
              </button>
              <button
                onClick={handleSubmit}
                disabled={!signature || !reviewerName.trim()}
                className={`px-14 py-6 rounded-3xl text-3xl font-bold text-white shadow-2xl transition-all flex items-center gap-4 ${
                  signature && reviewerName.trim()
                    ? allPassed
                      ? "bg-gradient-to-r from-success-500 to-teal-600 hover:scale-105"
                      : "bg-gradient-to-r from-warning-500 to-orange-500 hover:scale-105"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <ShieldCheck className="w-10 h-10" />
                {allPassed ? "确认并正式放行" : "仅签名留痕记录"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recentRecords = records.slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <PageHeader title="园门口复核" subtitle="保安/值班园长复核确认" />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div
            className={`card mb-6 border-4 ${
              allPassed ? "border-success-300" : "border-warning-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div
                  className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
                    allPassed
                      ? "bg-gradient-to-br from-success-100 to-teal-100"
                      : "bg-gradient-to-br from-warning-100 to-orange-100"
                  }`}
                >
                  {allPassed ? (
                    <span className="text-6xl animate-bounce-slow">✅</span>
                  ) : (
                    <span className="text-6xl animate-pulse">⚠️</span>
                  )}
                </div>
                <div>
                  <h2
                    className={`text-4xl font-bold mb-2 ${
                      allPassed ? "text-success-600" : "text-warning-600"
                    }`}
                  >
                    {allPassed ? "所有检查已通过" : "部分检查未完成"}
                  </h2>
                  <p className="text-xl text-gray-600">
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

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div
              className={`card border-4 transition-all ${
                inspectionPassed
                  ? "border-success-200 bg-gradient-to-br from-success-50 to-white"
                  : "border-warning-200 bg-gradient-to-br from-warning-50 to-white"
              }`}
            >
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                    inspectionPassed ? "bg-success-500" : "bg-warning-500"
                  }`}
                >
                  <ClipboardCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-navy-500">最近清车</h4>
                  <p className="text-sm text-gray-500">离车检查记录</p>
                </div>
              </div>
              {inspectionHistory.length > 0 || inspectionRecord ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-4 py-1 rounded-xl text-sm font-bold ${
                        inspectionPassed
                          ? "bg-success-100 text-success-700"
                          : "bg-warning-100 text-warning-700"
                      }`}
                    >
                      {inspectionPassed ? "✓ 已完成" : "⏳ 未完成"}
                    </span>
                    {inspectionHistory.length > 0 && (
                      <button
                        onClick={() => navigate(`/inspection/detail/${inspectionHistory[0].id}`)}
                        className="text-primary-600 text-sm font-bold hover:underline flex items-center gap-1"
                      >
                        详情
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 text-lg">
                    <p className="text-gray-600">
                      <span className="text-gray-400 mr-2">📊</span>
                      进度：
                      <span className="font-bold text-navy-500">
                        {inspectionRecord
                          ? `${inspectionRecord.areas.filter(a => a.checked).length}/7`
                          : inspectionHistory[0]
                            ? `${inspectionHistory[0].areas.filter(a => a.checked).length}/7`
                            : "0/7"}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-400 mr-2">⏰</span>
                      {inspectionRecord?.createdAt
                        ? formatDateTime(new Date(inspectionRecord.createdAt))
                        : inspectionHistory[0]?.createdAt
                          ? formatDateTime(new Date(inspectionHistory[0].createdAt))
                          : "暂无记录"}
                    </p>
                    {(inspectionRecord || inspectionHistory[0]) && (
                      <p className="text-gray-600">
                        <span className="text-gray-400 mr-2">👤</span>
                        检查人：
                        <span className="font-bold text-navy-500">
                          {inspectionRecord?.inspectorName || inspectionHistory[0]?.inspectorName || "—"}
                        </span>
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xl text-gray-400 text-center py-6">暂无清车记录</p>
              )}
            </div>

            <div
              className={`card border-4 transition-all ${
                rollcallPassed
                  ? "border-success-200 bg-gradient-to-br from-success-50 to-white"
                  : "border-warning-200 bg-gradient-to-br from-warning-50 to-white"
              }`}
            >
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                    rollcallPassed ? "bg-success-500" : "bg-warning-500"
                  }`}
                >
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-navy-500">最近点名</h4>
                  <p className="text-sm text-gray-500">儿童交接记录</p>
                </div>
              </div>
              {rollcallHistory.length > 0 || rollcallRecord ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-4 py-1 rounded-xl text-sm font-bold ${
                        rollcallPassed
                          ? "bg-success-100 text-success-700"
                          : "bg-warning-100 text-warning-700"
                      }`}
                    >
                      {rollcallPassed ? "✓ 已完成" : "⏳ 进行中"}
                    </span>
                  </div>
                  <div className="space-y-2 text-lg">
                    <p className="text-gray-600">
                      <span className="text-gray-400 mr-2">👧</span>
                      儿童：
                      <span className="font-bold text-navy-500">
                        {rollcallRecord
                          ? `${rollcallRecord.children.filter(c => c.status !== "pending").length}/${rollcallRecord.children.length}`
                          : rollcallHistory[0]
                            ? `${rollcallHistory[0].children.filter(c => c.status !== "pending").length}/${rollcallHistory[0].children.length}`
                            : "0/0"}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-400 mr-2">⏰</span>
                      {rollcallRecord?.createdAt
                        ? formatDateTime(new Date(rollcallRecord.createdAt))
                        : rollcallHistory[0]?.createdAt
                          ? formatDateTime(new Date(rollcallHistory[0].createdAt))
                          : "暂无记录"}
                    </p>
                    {(rollcallRecord || rollcallHistory[0]) && (
                      <p className="text-gray-600">
                        <span className="text-gray-400 mr-2">🏫</span>
                        班级：
                        <span className="font-bold text-navy-500">
                          {(rollcallRecord?.classIds || rollcallHistory[0]?.classIds || []).length}个班
                        </span>
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xl text-gray-400 text-center py-6">暂无点名记录</p>
              )}
            </div>

            <div
              className={`card border-4 transition-all ${
                records.length > 0 && records[0].passed
                  ? "border-success-200 bg-gradient-to-br from-success-50 to-white"
                  : records.length > 0
                    ? "border-warning-200 bg-gradient-to-br from-warning-50 to-white"
                    : "border-gray-200 bg-gradient-to-br from-gray-50 to-white"
              }`}
            >
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                    records.length > 0
                      ? records[0].passed
                        ? "bg-success-500"
                        : "bg-warning-500"
                      : "bg-gray-400"
                  }`}
                >
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-navy-500">最近放行</h4>
                  <p className="text-sm text-gray-500">签名/复核记录</p>
                </div>
              </div>
              {records.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-4 py-1 rounded-xl text-sm font-bold ${
                        records[0].passed
                          ? "bg-success-100 text-success-700"
                          : "bg-warning-100 text-warning-700"
                      }`}
                    >
                      {records[0].passed
                        ? "✓ 正式放行"
                        : "📝 签名留痕"}
                    </span>
                  </div>
                  <div className="space-y-2 text-lg">
                    <p className="text-gray-600">
                      <span className="text-gray-400 mr-2">👤</span>
                      复核人：
                      <span className="font-bold text-navy-500">{records[0].reviewerName}</span>
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-400 mr-2">⏰</span>
                      {records[0].releasedAt
                        ? `放行：${formatDateTime(new Date(records[0].releasedAt))}`
                        : `签名：${formatDateTime(new Date(records[0].createdAt))}`}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          records[0].inspectionPassed
                            ? "bg-success-50 text-success-700"
                            : "bg-warning-50 text-warning-700"
                        }`}
                      >
                        清车 {records[0].inspectionPassed ? "✓" : "✗"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          records[0].rollcallPassed
                            ? "bg-success-50 text-success-700"
                            : "bg-warning-50 text-warning-700"
                        }`}
                      >
                        点名 {records[0].rollcallPassed ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xl text-gray-400 text-center py-6">暂无复核记录</p>
              )}
            </div>
          </div>

          <StatusOverview />

          <div className="flex justify-center mt-8 mb-10">
            <button
              onClick={() => setStep("signature")}
              className={`px-16 py-7 rounded-3xl text-3xl font-bold text-white shadow-2xl transition-all flex items-center gap-4 ${
                allPassed
                  ? "bg-gradient-to-r from-navy-500 to-indigo-600 hover:scale-105"
                  : "bg-gradient-to-r from-warning-500 to-orange-500 hover:scale-105"
              }`}
            >
              <ShieldCheck className="w-10 h-10" />
              {allPassed ? "前往签名放行 →" : "前往签名留痕 →"}
            </button>
          </div>

          {recentRecords.length > 0 && (
            <div className="card bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-700 flex items-center gap-3">
                  <Clock className="w-7 h-7" />
                  最近复核记录（{recentRecords.length}条）
                </h3>
                {inspectionHistory.length > 0 && (
                  <button
                    onClick={() => navigate("/inspection/detail")}
                    className="text-primary-600 font-bold text-lg hover:underline flex items-center gap-1"
                  >
                    查看清车详情
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="space-y-3 max-h-[500px] overflow-auto">
                {recentRecords.map((rec, idx) => (
                  <div
                    key={rec.id}
                    className={`bg-white rounded-2xl p-5 border-2 ${
                      rec.passed
                        ? "border-success-100 hover:border-success-300"
                        : "border-warning-100 hover:border-warning-300"
                    } transition-colors`}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${
                            rec.passed ? "bg-success-500" : "bg-warning-500"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xl font-bold text-navy-500">
                            {rec.reviewerName}
                            <span
                              className={`ml-3 px-3 py-1 rounded-lg text-sm font-bold ${modeClass(
                                rec.mode
                              )}`}
                            >
                              {modeLabel(rec.mode)}
                            </span>
                          </p>
                          <p className="text-lg text-gray-500 flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            {formatDateTime(new Date(rec.createdAt))}
                            {rec.passed && rec.releasedAt && (
                              <span className="text-success-600 font-medium ml-2">
                                · 放行 {formatTime(new Date(rec.releasedAt))}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex flex-col items-end text-sm">
                          <span
                            className={`px-3 py-1 rounded-lg font-medium ${
                              rec.inspectionPassed
                                ? "bg-success-50 text-success-700"
                                : "bg-warning-50 text-warning-700"
                            }`}
                          >
                            清车 {rec.inspectionPassed ? "✓" : "✗"}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-lg font-medium mt-1 ${
                              rec.rollcallPassed
                                ? "bg-success-50 text-success-700"
                                : "bg-warning-50 text-warning-700"
                            }`}
                          >
                            点名 {rec.rollcallPassed ? "✓" : "✗"}
                          </span>
                        </div>
                        {rec.signature && (
                          <img
                            src={rec.signature}
                            alt="签名"
                            className="w-28 h-14 object-contain border border-gray-200 rounded-lg bg-white p-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
