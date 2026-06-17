import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Users, ShieldCheck, Bus, Circle } from "lucide-react";
import { mockBus } from "@/data/bus";
import { formatTime } from "@/utils/time";
import { useInspectionStore } from "@/store/useInspectionStore";
import { useRollcallStore } from "@/store/useRollcallStore";

export default function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { record: inspectionRecord, isAllAreasChecked } = useInspectionStore();
  const { isRollcallComplete, getTotalCount, getCompletedCount } = useRollcallStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const inspectionDone = inspectionRecord?.completed || isAllAreasChecked();
  const rollcallDone =
    getTotalCount() > 0 && isRollcallComplete();

  const menuItems = [
    {
      title: "离车检查",
      description: "分区巡检校车，确认无儿童滞留",
      icon: ClipboardCheck,
      path: "/inspection",
      gradient: "from-orange-400 to-primary-500",
      completed: inspectionDone,
      emoji: "🔍",
    },
    {
      title: "儿童点名",
      description: "核对儿童交接状态",
      icon: Users,
      path: "/rollcall",
      gradient: "from-teal-400 to-success-500",
      completed: rollcallDone,
      emoji: "👧",
    },
    {
      title: "园门口复核",
      description: "保安/园长签名放行",
      icon: ShieldCheck,
      path: "/review",
      gradient: "from-indigo-500 to-navy-500",
      completed: false,
      emoji: "🛡️",
    },
  ];

  return (
    <div className="min-h-screen p-8 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center shadow-xl">
            <Bus className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-navy-500">校车安全巡检终端</h1>
            <p className="text-xl text-gray-500 mt-1">幼儿园儿童滞留检查系统</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-navy-500 font-mono">
            {formatTime(currentTime)}
          </div>
          <div className="flex items-center gap-2 mt-2 justify-end">
            <Circle
              className={`w-4 h-4 ${mockBus.status === "stopped" ? "text-warning-500 fill-warning-500" : "text-success-500 fill-success-500"} animate-pulse`}
            />
            <span className="text-xl text-gray-600">
              {mockBus.status === "stopped" ? "车辆已熄火" : "车辆行驶中"}
            </span>
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-left">
              <p className="text-gray-500 text-lg">车牌号</p>
              <p className="text-3xl font-bold text-navy-500">{mockBus.plateNumber}</p>
            </div>
            <div className="w-px h-16 bg-gray-200" />
            <div className="text-left">
              <p className="text-gray-500 text-lg">司机</p>
              <p className="text-3xl font-bold text-navy-500">{mockBus.driverName}</p>
            </div>
            <div className="w-px h-16 bg-gray-200" />
            <div className="text-left">
              <p className="text-gray-500 text-lg">今日日期</p>
              <p className="text-3xl font-bold text-navy-500">
                {currentTime.toLocaleDateString("zh-CN")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {inspectionDone && (
              <div className="bg-success-50 text-success-600 px-6 py-3 rounded-2xl flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span className="text-xl font-bold">离车检查已完成</span>
              </div>
            )}
            {rollcallDone && (
              <div className="bg-success-50 text-success-600 px-6 py-3 rounded-2xl flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span className="text-xl font-bold">点名已完成 {getCompletedCount()}/{getTotalCount()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-8">
        {menuItems.map((item, index) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`relative card p-10 text-left hover:shadow-2xl transition-all duration-300 
              hover:-translate-y-2 animate-slide-up cursor-pointer overflow-hidden group`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${item.gradient} 
                rounded-full -translate-y-1/2 translate-x-1/2 opacity-10 group-hover:opacity-20 transition-opacity`}
            />
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${item.gradient} 
                flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform`}
            >
              <span className="text-5xl">{item.emoji}</span>
            </div>
            <h2 className="text-4xl font-bold text-navy-500 mb-3">{item.title}</h2>
            <p className="text-xl text-gray-500 leading-relaxed">{item.description}</p>
            {item.completed && (
              <div className="absolute bottom-6 right-6 bg-success-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                <span className="text-xl">✓</span>
                <span className="font-bold">已完成</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {mockBus.status === "stopped" && (
        <div className="mt-8 bg-gradient-to-r from-warning-500 to-orange-500 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between animate-pulse-slow">
          <div className="flex items-center gap-4">
            <span className="text-5xl">⚠️</span>
            <div>
              <p className="text-2xl font-bold">车辆已熄火，请立即开始离车检查！</p>
              <p className="text-lg opacity-90 mt-1">从车头走到车尾，确认每一个区域都没有儿童滞留</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/inspection")}
            className="bg-white text-warning-600 px-10 py-5 rounded-2xl text-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            立即开始检查 →
          </button>
        </div>
      )}
    </div>
  );
}
