"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUsers } from "@/hooks/useUsers";
import { useEmployers } from "@/hooks/useEmployers";
import { useDashboard } from "@/hooks/useDashboard";
import { EmployerUpdateResponse } from "@/types/employer";
import {
  Users,
  Building,
  ShieldAlert,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Loader2,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // Chart interactivity states
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeMetrics, setActiveMetrics] = useState({
    candidates: true,
    employers: true,
    jobs: true,
    applications: true
  });

  // Services and Hooks
  const {
    summary,
    trends,
    isSummaryLoading,
    isTrendsLoading,
    fetchSummary,
    fetchTrends
  } = useDashboard();

  const { fetchPendingCompanies, approveEmployer, rejectEmployer } = useEmployers();

  // Recent pending companies
  const [pendingCompanies, setPendingCompanies] = useState<EmployerUpdateResponse[]>([]);

  // Function to load all dashboard data from backend
  const loadDashboardData = useCallback(async (days = selectedDays) => {
    setStatsLoading(true);
    try {
      const [_, __, pendingRes] = await Promise.all([
        fetchSummary(),
        fetchTrends(days),
        fetchPendingCompanies(0, 3).catch(() => null)
      ]);
      if (pendingRes) {
        setPendingCompanies(pendingRes.content || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [fetchSummary, fetchTrends, fetchPendingCompanies, selectedDays]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Fetch trends separately when timeframe changes (skipping initial to avoid duplicate requests since loadDashboardData handles it)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchTrends(selectedDays).catch(() => { });
  }, [selectedDays, fetchTrends]);

  // Quick Action Handlers
  const handleApproveQuick = async (company: EmployerUpdateResponse) => {
    if (!window.confirm(`Phê duyệt hồ sơ pháp lý doanh nghiệp "${company.companyName}"?`)) return;
    setActionLoading(true);
    try {
      await approveEmployer(company.employerId);
      toast.success(`Đã duyệt doanh nghiệp "${company.companyName}" thành công!`);
      await loadDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Phê duyệt thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectQuick = async (company: EmployerUpdateResponse) => {
    const reason = window.prompt(`Nhập lý do từ chối cho "${company.companyName}":`);
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Lý do từ chối không được để trống!");
      return;
    }

    setActionLoading(true);
    try {
      await rejectEmployer(company.id, { reason });
      toast.success(`Đã từ chối doanh nghiệp "${company.companyName}"!`);
      await loadDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Từ chối thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  // Date Formatting helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Salary formatting helper
  const formatSalary = (min: number, max: number, type: string) => {
    if (type === "NEGOTIABLE" || type === "Lương thỏa thuận" || !min) return "Thỏa thuận";
    return `${(min / 1000000).toFixed(0)} - ${(max / 1000000).toFixed(0)} Tr`;
  };

  // Dynamic SVG Chart paths calculation
  const getGraphData = () => {
    const width = 500;
    const height = 200;
    const paddingX = 40;
    const paddingXRight = 15;
    const paddingY = 25;
    const graphWidth = width - paddingX - paddingXRight;
    const graphHeight = height - 2 * paddingY;

    if (!trends || trends.length === 0) {
      return { paths: [], maxVal: 5, graphWidth, graphHeight, paddingX, paddingY, width, height, paddingXRight };
    }

    // Find max value across all active metrics
    const activeKeys = (Object.keys(activeMetrics) as Array<keyof typeof activeMetrics>).filter(
      k => activeMetrics[k]
    );
    const allValues: number[] = [];
    trends.forEach(t => {
      activeKeys.forEach(k => {
        allValues.push((t[k] as number) || 0);
      });
    });
    const maxVal = Math.max(...allValues, 5);

    const paths = (Object.keys(activeMetrics) as Array<keyof typeof activeMetrics>).map(key => {
      const isActive = activeMetrics[key];
      if (!isActive) return { key, linePath: "", areaPath: "", color: "", gradientId: "", points: [] };

      const points = trends.map((item, index) => {
        const x = paddingX + (index * graphWidth) / (trends.length - 1 || 1);
        const val = (item[key] as number) || 0;
        // Invert Y coordinate
        const y = height - paddingY - (val * graphHeight) / maxVal;
        return { x, y, val, date: item.date };
      });

      let linePath = "";
      let areaPath = "";

      if (points.length > 0) {
        // Draw highly organic smooth cubic bezier spline curves
        linePath = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const cpX1 = p0.x + (p1.x - p0.x) / 3;
          const cpY1 = p0.y;
          const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
          const cpY2 = p1.y;
          linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
        }
        areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
      }

      let color = "";
      let gradientId = "";
      switch (key) {
        case "candidates":
          color = "#0D9488"; // Teal
          gradientId = "colorTeal";
          break;
        case "employers":
          color = "#4F46E5"; // Indigo
          gradientId = "colorIndigo";
          break;
        case "jobs":
          color = "#8B5CF6"; // Violet
          gradientId = "colorViolet";
          break;
        case "applications":
          color = "#F59E0B"; // Amber
          gradientId = "colorAmber";
          break;
      }

      return { key, linePath, areaPath, color, gradientId, points };
    });

    return { paths, maxVal, graphWidth, graphHeight, paddingX, paddingY, width, height, paddingXRight };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!trends || trends.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 500;

    const paddingX = 40;
    const paddingXRight = 15;
    const graphWidth = 500 - paddingX - paddingXRight;

    let index = Math.round(((mouseX - paddingX) / graphWidth) * (trends.length - 1));
    if (index < 0) index = 0;
    if (index >= trends.length) index = trends.length - 1;

    setHoveredIndex(index);
  };

  const renderHoverIndicators = () => {
    if (hoveredIndex === null || !trends || trends.length === 0) return null;
    const { paths, graphWidth, paddingX, paddingY, height } = getGraphData();
    const x = paddingX + (hoveredIndex * graphWidth) / (trends.length - 1 || 1);

    return (
      <g>
        {/* Dotted indicator line */}
        <line
          x1={x}
          y1={10}
          x2={x}
          y2={height - paddingY}
          stroke="#E2E8F0"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />
        {/* Draw markers */}
        {paths.map(p => {
          if (!p.linePath || !p.points || !p.points[hoveredIndex]) return null;
          const pt = p.points[hoveredIndex];
          return (
            <g key={p.key}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill={p.color}
                stroke="#FFFFFF"
                strokeWidth="2"
                className="shadow-sm"
              />
            </g>
          );
        })}
      </g>
    );
  };

  const renderTooltip = () => {
    if (hoveredIndex === null || !trends || trends.length === 0) return null;
    const trendItem = trends[hoveredIndex];

    let displayDate = trendItem.date;
    try {
      const parts = trendItem.date.split("-");
      if (parts.length === 3) {
        displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch (e) { }

    return (
      <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-gray-100 shadow-xl z-20 pointer-events-none min-w-[180px] text-left transition-all duration-200">
        <p className="text-[10px] font-bold text-gray-400 mb-2 font-mono flex items-center gap-1">
          <Clock size={10} />
          {displayDate}
        </p>
        <div className="space-y-1.5 text-[11px] font-semibold">
          {activeMetrics.candidates && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0D9488]" />
                <span className="text-gray-500">Ứng viên:</span>
              </div>
              <span className="font-extrabold text-gray-800">{trendItem.candidates}</span>
            </div>
          )}
          {activeMetrics.employers && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4F46E5]" />
                <span className="text-gray-500">Doanh nghiệp:</span>
              </div>
              <span className="font-extrabold text-gray-800">{trendItem.employers}</span>
            </div>
          )}
          {activeMetrics.jobs && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
                <span className="text-gray-500">Việc làm:</span>
              </div>
              <span className="font-extrabold text-gray-800">{trendItem.jobs}</span>
            </div>
          )}
          {activeMetrics.applications && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-gray-500">Ứng tuyển:</span>
              </div>
              <span className="font-extrabold text-gray-800">{trendItem.applications}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTrendChart = () => {
    const { paths, maxVal, graphWidth, graphHeight, paddingX, paddingY, width, height, paddingXRight } = getGraphData();

    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col h-96 relative select-none">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="font-extrabold text-sm text-gray-800">Biểu đồ xu hướng hoạt động</h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
              Thống kê lượng đăng ký & tương tác hệ thống theo thời gian
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Chart Type Selector */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${chartType === "line" ? "bg-[#006B7A] text-white shadow-xs" : "text-gray-500 hover:bg-gray-100"}`}
              >
                Đường cong
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${chartType === "bar" ? "bg-[#006B7A] text-white shadow-xs" : "text-gray-500 hover:bg-gray-100"}`}
              >
                Cột nhóm
              </button>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
              <button
                onClick={() => setSelectedDays(7)}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${selectedDays === 7 ? "bg-[#006B7A] text-white shadow-xs" : "text-gray-500 hover:bg-gray-100"}`}
              >
                7 Ngày
              </button>
              <button
                onClick={() => setSelectedDays(15)}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${selectedDays === 15 ? "bg-[#006B7A] text-white shadow-xs" : "text-gray-500 hover:bg-gray-100"}`}
              >
                15 Ngày
              </button>
              <button
                onClick={() => setSelectedDays(30)}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${selectedDays === 30 ? "bg-[#006B7A] text-white shadow-xs" : "text-gray-500 hover:bg-gray-100"}`}
              >
                30 Ngày
              </button>
            </div>
          </div>
        </div>

        {/* Legend / Metrics Toggles */}
        <div className="flex flex-wrap items-center gap-3.5 text-[9px] font-bold mb-4 bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100/50">
          <button
            onClick={() => setActiveMetrics(p => ({ ...p, candidates: !p.candidates }))}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${activeMetrics.candidates ? "bg-teal-50 border-teal-200 text-teal-700 shadow-xs" : "bg-white border-gray-200 text-gray-400"}`}
          >
            <span className="h-2 w-2 rounded-full bg-[#0D9488]" />
            Ứng viên
          </button>
          <button
            onClick={() => setActiveMetrics(p => ({ ...p, employers: !p.employers }))}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${activeMetrics.employers ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs" : "bg-white border-gray-200 text-gray-400"}`}
          >
            <span className="h-2 w-2 rounded-full bg-[#4F46E5]" />
            Doanh nghiệp
          </button>
          <button
            onClick={() => setActiveMetrics(p => ({ ...p, jobs: !p.jobs }))}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${activeMetrics.jobs ? "bg-violet-50 border-violet-200 text-violet-700 shadow-xs" : "bg-white border-gray-200 text-gray-400"}`}
          >
            <span className="h-2 w-2 rounded-full bg-[#8B5CF6]" />
            Việc làm
          </button>
          <button
            onClick={() => setActiveMetrics(p => ({ ...p, applications: !p.applications }))}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${activeMetrics.applications ? "bg-amber-50 border-amber-200 text-amber-700 shadow-xs" : "bg-white border-gray-200 text-gray-400"}`}
          >
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            Ứng tuyển
          </button>
        </div>

        {/* SVG Area Chart */}
        <div className="flex-1 w-full relative pt-2 overflow-hidden">
          {isTrendsLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="animate-spin text-[#006B7A]" size={28} />
              <span className="text-[10px] font-bold">Đang cập nhật biểu đồ...</span>
            </div>
          ) : trends.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-center font-medium">
              <TrendingUp size={32} className="mb-2 text-gray-300" />
              <span className="text-xs font-bold text-gray-700">Chưa có dữ liệu xu hướng</span>
              <span className="text-[9px] text-gray-400 mt-1">Chưa có thông tin hoạt động trong thời gian này.</span>
            </div>
          ) : (
            <>
              {renderTooltip()}
              <svg
                className="w-full h-full overflow-hidden"
                viewBox="0 0 500 200"
                preserveAspectRatio="none"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <defs>
                  <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorViolet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* Vertical Hover Highlight Column Backdrop */}
                {hoveredIndex !== null && (() => {
                  const dayWidth = graphWidth / (trends.length || 1);
                  const x = paddingX + (hoveredIndex * graphWidth) / (trends.length - 1 || 1);
                  return (
                    <rect
                      x={x - dayWidth / 2}
                      y={10}
                      width={dayWidth}
                      height={height - paddingY - 10}
                      fill="#F1F5F9"
                      opacity="0.4"
                      rx="4"
                      className="pointer-events-none"
                    />
                  );
                })()}

                {/* Y-Axis Value Labels & Horizontal Grid Lines */}
                {(() => {
                  const tickValues = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];
                  return tickValues.map((tick, i) => {
                    const y = height - paddingY - (tick * graphHeight) / maxVal;
                    return (
                      <g key={i} className="opacity-95">
                        <text
                          x={paddingX - 10}
                          y={y + 3}
                          textAnchor="end"
                          fill="#94A3B8"
                          fontSize="7.5"
                          fontWeight="bold"
                          className="font-mono select-none"
                        >
                          {Math.round(tick)}
                        </text>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={width - paddingXRight}
                          y2={y}
                          stroke={i === 0 ? "#E2E8F0" : "#F1F5F9"}
                          strokeWidth={i === 0 ? "1.5" : "1"}
                          strokeDasharray={i === 0 ? "none" : "3,3"}
                        />
                      </g>
                    );
                  });
                })()}

                {/* Dynamic Area & Line Paths OR Grouped vertical rounded columns */}
                {chartType === "line" ? (
                  paths.map(p => {
                    if (!p.linePath) return null;
                    return (
                      <g key={p.key}>
                        <path d={p.areaPath} fill={`url(#${p.gradientId})`} />
                        <path
                          d={p.linePath}
                          fill="none"
                          stroke={p.color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    );
                  })
                ) : (
                  (() => {
                    const activeKeys = (Object.keys(activeMetrics) as Array<keyof typeof activeMetrics>).filter(
                      k => activeMetrics[k]
                    );
                    const numActive = activeKeys.length;
                    if (numActive === 0) return null;

                    const barSpacing = 1.5;
                    const dayWidth = graphWidth / (trends.length || 1);
                    const barGroupWidth = dayWidth * 0.65;
                    const individualBarWidth = Math.max((barGroupWidth - (numActive - 1) * barSpacing) / numActive, 2.5);

                    return trends.map((trendItem, i) => {
                      const dayCenterX = paddingX + (i * graphWidth) / (trends.length - 1 || 1);
                      const groupStartX = dayCenterX - barGroupWidth / 2;

                      return activeKeys.map((key, metricIdx) => {
                        const val = (trendItem[key] as number) || 0;
                        const barHeight = (val * graphHeight) / maxVal;
                        const barX = groupStartX + metricIdx * (individualBarWidth + barSpacing);
                        const barY = height - paddingY - barHeight;

                        let color = "";
                        switch (key) {
                          case "candidates": color = "#0D9488"; break;
                          case "employers": color = "#4F46E5"; break;
                          case "jobs": color = "#8B5CF6"; break;
                          case "applications": color = "#F59E0B"; break;
                        }

                        if (barHeight === 0) return null;

                        return (
                          <rect
                            key={`${i}-${key}`}
                            x={barX}
                            y={barY}
                            width={individualBarWidth}
                            height={barHeight}
                            fill={color}
                            rx="1.5"
                            className="transition-all duration-300 hover:opacity-85"
                          />
                        );
                      });
                    });
                  })()
                )}

                {/* Interactive markers */}
                {chartType === "line" && renderHoverIndicators()}
              </svg>
            </>
          )}
        </div>

        {/* X Axis Labels */}
        <div className="flex items-center justify-between text-[7.5px] font-bold text-gray-400 mt-3 font-mono" style={{ paddingLeft: `${paddingX}px`, paddingRight: `${paddingXRight}px` }}>
          {trends && trends.length > 0 ? (
            <>
              <span>{trends[0].date.split("-").slice(1).reverse().join("/")}</span>
              {trends.length > 2 && (
                <span>{trends[Math.floor(trends.length / 2)].date.split("-").slice(1).reverse().join("/")}</span>
              )}
              <span>{trends[trends.length - 1].date.split("-").slice(1).reverse().join("/")}</span>
            </>
          ) : (
            <span>N/A</span>
          )}
        </div>
      </div>
    );
  };



  const metrics = summary?.metrics;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Bảng điều khiển</h1>
          <p className="text-gray-400 mt-1 text-xs font-medium">
            Tổng quan hoạt động nền tảng DaNangJobs · Cập nhật thời gian thực
          </p>
        </div>
        <button
          onClick={() => loadDashboardData()}
          disabled={statsLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#006B7A] hover:bg-[#005a66] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {statsLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <TrendingUp size={13} />
          )}
          Làm mới
        </button>
      </div>

      {/* 2. Stats Grid Row - Dynamic 6 Cards Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Candidates */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1 min-w-0">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate">Ứng viên</p>
            {statsLoading ? (
              <div className="h-6 w-12 bg-gray-150 rounded animate-pulse mt-1" />
            ) : (
              <h3 className="text-xl font-extrabold text-teal-600 tracking-tight">{metrics?.totalCandidates || 0}</h3>
            )}
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl flex-shrink-0">
            <UserCheck size={18} />
          </div>
        </div>

        {/* Card 2: Employers */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1 min-w-0">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate">Doanh nghiệp</p>
            {statsLoading ? (
              <div className="h-6 w-12 bg-gray-150 rounded animate-pulse mt-1" />
            ) : (
              <h3 className="text-xl font-extrabold text-indigo-600 tracking-tight">{metrics?.totalEmployers || 0}</h3>
            )}
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
            <Building size={18} />
          </div>
        </div>

        {/* Card 3: Jobs */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1 min-w-0">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate">Tin tuyển dụng</p>
            {statsLoading ? (
              <div className="h-6 w-12 bg-gray-150 rounded animate-pulse mt-1" />
            ) : (
              <h3 className="text-xl font-extrabold text-violet-600 tracking-tight">{metrics?.totalJobs || 0}</h3>
            )}
          </div>
          <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl flex-shrink-0">
            <Briefcase size={18} />
          </div>
        </div>

        {/* Card 4: Applications */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1 min-w-0">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate">Đơn ứng tuyển</p>
            {statsLoading ? (
              <div className="h-6 w-12 bg-gray-150 rounded animate-pulse mt-1" />
            ) : (
              <h3 className="text-xl font-extrabold text-sky-600 tracking-tight">{metrics?.totalApplications || 0}</h3>
            )}
          </div>
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl flex-shrink-0">
            <FileText size={18} />
          </div>
        </div>

        {/* Card 5: Pending Employers */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1 min-w-0">
            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider truncate">DN Chờ Duyệt</p>
            {statsLoading ? (
              <div className="h-6 w-12 bg-gray-150 rounded animate-pulse mt-1" />
            ) : (
              <h3 className={`text-xl font-extrabold text-amber-600 tracking-tight ${metrics?.pendingEmployers && metrics.pendingEmployers > 0 ? "animate-pulse" : ""}`}>
                {metrics?.pendingEmployers || 0}
              </h3>
            )}
          </div>
          <div className={`p-2.5 bg-amber-50 text-amber-500 rounded-xl flex-shrink-0 ${metrics?.pendingEmployers && metrics.pendingEmployers > 0 ? "animate-bounce" : ""}`}>
            <ShieldAlert size={18} />
          </div>
        </div>

        {/* Card 6: Pending Jobs */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1 min-w-0">
            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-wider truncate">Tin Chờ Duyệt</p>
            {statsLoading ? (
              <div className="h-6 w-12 bg-gray-150 rounded animate-pulse mt-1" />
            ) : (
              <h3 className={`text-xl font-extrabold text-rose-600 tracking-tight ${metrics?.pendingJobs && metrics.pendingJobs > 0 ? "animate-pulse" : ""}`}>
                {metrics?.pendingJobs || 0}
              </h3>
            )}
          </div>
          <div className={`p-2.5 bg-rose-50 text-rose-500 rounded-xl flex-shrink-0 ${metrics?.pendingJobs && metrics.pendingJobs > 0 ? "animate-bounce animate-duration-1000" : ""}`}>
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Dynamic SVG Graph & Category/Status Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Graph - Span 2 */}
        <div className="lg:col-span-2">{renderTrendChart()}</div>

        {/* Categories Progress Bar Chart panel - Span 1 */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col h-96 overflow-hidden">
          <div>
            <h4 className="font-extrabold text-sm text-gray-800">Cơ cấu ngành nghề nổi bật</h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Số lượng tin tuyển dụng phân theo lĩnh vực</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 space-y-4 pr-1">
            {statsLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <Loader2 size={24} className="animate-spin text-[#006B7A]" />
                <span className="text-[10px] font-bold">Đang phân tích cơ cấu...</span>
              </div>
            ) : !summary?.jobsByCategory || summary.jobsByCategory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center font-medium">
                <Briefcase size={28} className="text-gray-300 mb-2" />
                <span className="text-[11px] font-bold text-gray-700">Chưa có cơ cấu việc làm</span>
                <span className="text-[9px] text-gray-400 mt-1">Đăng thêm việc làm để hiển thị phân tích.</span>
              </div>
            ) : (
              (() => {
                const maxJobCount = Math.max(...summary.jobsByCategory.map(c => c.jobCount), 1);
                return summary.jobsByCategory.slice(0, 6).map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-extrabold text-gray-700">
                      <span className="truncate max-w-[70%]">{cat.categoryName}</span>
                      <span className="text-[#006B7A] font-mono">{cat.jobCount} tin</span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#006B7A] to-[#009fb2] transition-all duration-500"
                        style={{ width: `${(cat.jobCount / maxJobCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Tabs Container Table & Quick pending list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications by Status Statistics - Span 2 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col min-h-[380px] overflow-hidden">
          <div>
            <h4 className="font-extrabold text-sm text-gray-800">Thống kê trạng thái ứng tuyển</h4>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Tỷ lệ và số lượng đơn nộp phân bổ theo trạng thái hồ sơ</p>
          </div>

          <div className="flex-1 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Visual summary list */}
            <div className="space-y-3.5 flex flex-col justify-center">
              {statsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-[#006B7A]" />
                  <span className="text-[10px] font-bold">Đang phân tích trạng thái...</span>
                </div>
              ) : !summary?.applicationsByStatus || summary.applicationsByStatus.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-400 text-center font-medium py-10">
                  <FileText size={28} className="text-gray-300 mb-2" />
                  <span className="text-[11px] font-bold text-gray-700">Chưa có thống kê đơn nộp</span>
                </div>
              ) : (
                (() => {
                  const totalApps = summary.applicationsByStatus.reduce((acc, curr) => acc + curr.count, 0) || 1;
                  return summary.applicationsByStatus.map((status, idx) => {
                    const percentage = ((status.count / totalApps) * 100).toFixed(1);

                    let label = status.statusName;
                    let bgColor = "bg-gray-50 border-gray-150 text-gray-500";
                    let progressColor = "bg-gray-400";
                    let icon = <AlertCircle size={14} />;

                    if (status.statusName === "PENDING") {
                      label = "Hồ sơ chờ phản hồi";
                      bgColor = "bg-amber-50 border-amber-100 text-amber-700";
                      progressColor = "bg-amber-500";
                      icon = <Clock size={14} className="stroke-[2.5]" />;
                    } else if (status.statusName === "ACCEPTED") {
                      label = "Hồ sơ được chấp nhận";
                      bgColor = "bg-emerald-50 border-emerald-100 text-emerald-700";
                      progressColor = "bg-emerald-500";
                      icon = <CheckCircle2 size={14} className="stroke-[2.5]" />;
                    } else if (status.statusName === "REJECTED") {
                      label = "Hồ sơ bị từ chối";
                      bgColor = "bg-rose-50 border-rose-100 text-rose-700";
                      progressColor = "bg-rose-500";
                      icon = <XCircle size={14} className="stroke-[2.5]" />;
                    } else if (status.statusName === "CANCELLED") {
                      label = "Hồ sơ đã hủy";
                      bgColor = "bg-gray-50 border-gray-150 text-gray-500";
                      progressColor = "bg-gray-400";
                      icon = <AlertCircle size={14} className="stroke-[2.5]" />;
                    }

                    return (
                      <div key={idx} className="p-3 bg-gray-50/50 border border-gray-100/50 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded-lg ${bgColor} flex-shrink-0`}>
                              {icon}
                            </span>
                            <span className="font-extrabold text-gray-700">{label}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-gray-800 font-mono">{status.count} đơn </span>
                            <span className="text-gray-400 text-[10px] font-bold">({percentage}%)</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progressColor} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Right Column: Visual comparisons / charts explanation / callout */}
            <div className="flex flex-col justify-between p-4.5 bg-gradient-to-br from-gray-50 to-gray-50/30 border border-gray-100 rounded-3xl">
              <div className="space-y-3">
                <div className="p-2.5 bg-[#006B7A]/5 text-[#006B7A] rounded-2xl w-fit">
                  <TrendingUp size={20} className="stroke-[2.5]" />
                </div>
                <h5 className="font-extrabold text-[12px] text-gray-800 leading-snug">Góc nhìn xu hướng tuyển dụng</h5>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                  Tỷ lệ hồ sơ được chấp nhận phản ánh hiệu quả kết nối của hệ thống. Tỷ lệ chờ duyệt cao cho thấy ứng viên đang tích cực nộp đơn và doanh nghiệp cần đẩy nhanh tiến độ phê duyệt.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100/80 mt-4 flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Cập nhật mới nhất</span>
                <span className="font-mono text-[#006B7A] font-bold bg-[#006B7A]/5 px-2 py-0.5 rounded-lg">
                  Thời gian thực
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Pending Approvals panel - Span 1 */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col h-[380px] overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-extrabold text-sm text-gray-800">Duyệt hồ sơ nhanh</h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Yêu cầu đăng ký doanh nghiệp mới cần phê duyệt</p>
            </div>
            <Link
              href="/admin/employer"
              className="text-[#006B7A] hover:underline text-[9px] font-extrabold flex items-center gap-0.5"
            >
              <span>Xem hết</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
            {statsLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <Loader2 size={24} className="animate-spin text-[#006B7A]" />
                <span className="text-[10px] font-bold">Đang tải danh sách chờ duyệt...</span>
              </div>
            ) : pendingCompanies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center font-medium py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                <ShieldCheck size={28} className="text-emerald-500 mb-2" />
                <span className="text-[11px] font-bold text-gray-700">Đã giải quyết toàn bộ!</span>
                <span className="text-[9px] text-gray-400 mt-1">Không có hồ sơ doanh nghiệp nào chờ phê duyệt.</span>
              </div>
            ) : (
              pendingCompanies.map(c => (
                <div
                  key={c.id}
                  className="p-3 bg-gray-50/70 border border-gray-100/50 rounded-2xl flex items-center justify-between gap-3 hover:bg-gray-50 hover:shadow-xs transition-all duration-200 group"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center font-bold text-xs shadow-inner bg-white flex-shrink-0 relative">
                      {c.logoUrl && c.logoUrl.trim() !== "" ? (
                        <img src={c.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#006B7A] to-[#009fb2] text-white flex items-center justify-center font-bold font-mono text-xs">
                          {c.companyName ? c.companyName.slice(0, 2).toUpperCase() : "DN"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[11px] text-gray-800 leading-snug truncate group-hover:text-[#006B7A] transition-colors">
                        {c.companyName}
                      </p>
                      <p className="text-[9px] text-gray-400 font-mono font-bold mt-1">MST: {c.taxCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleRejectQuick(c)}
                      disabled={actionLoading}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer border border-rose-100/50 active:scale-95 disabled:opacity-50"
                      title="Từ chối hồ sơ"
                    >
                      <X size={12} className="stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => handleApproveQuick(c)}
                      disabled={actionLoading}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all cursor-pointer border border-emerald-100/50 active:scale-95 disabled:opacity-50"
                      title="Phê duyệt hồ sơ"
                    >
                      <Check size={12} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
