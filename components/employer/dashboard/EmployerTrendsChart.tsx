"use client";

import React, { useState } from "react";
import { Briefcase, UserCheck, Calendar } from "lucide-react";
import { EmployerDailyTrendResponse } from "@/types/dashboard";

interface EmployerTrendsChartProps {
  trends: EmployerDailyTrendResponse[];
  loading?: boolean;
}

export default function EmployerTrendsChart({ trends = [], loading = false }: EmployerTrendsChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm animate-pulse space-y-4 h-[350px]">
        <div className="flex justify-between items-center">
          <div className="space-y-2 w-1/3">
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded w-24"></div>
        </div>
        <div className="h-[230px] bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm h-[350px] flex flex-col items-center justify-center text-slate-400 font-bold">
        Chưa có dữ liệu xu hướng hoạt động.
      </div>
    );
  }

  // Dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Max values
  const jobPostsList = trends.map((t) => Number(t.jobPosts ?? 0));
  const appsList = trends.map((t) => Number(t.applications ?? 0));
  const maxJobPosts = Math.max(...jobPostsList, 4);
  const maxApps = Math.max(...appsList, 2);

  // Grouped bar variables
  const groupWidth = chartWidth / trends.length;
  const barWidth = Math.max(3, groupWidth * 0.35); // width of individual bar
  const barGap = 1.5; // gap between the two bars of the same day

  // Generate bar coordinates
  const bars = trends.map((t, index) => {
    const jobPostsVal = Number(t.jobPosts ?? 0);
    const appsVal = Number(t.applications ?? 0);

    const xGroupStart = paddingLeft + index * groupWidth;

    // Center the bars inside the group
    const xJobPosts = xGroupStart + (groupWidth - (2 * barWidth + barGap)) / 2;
    const xApps = xJobPosts + barWidth + barGap;

    // Height calculation relative to max values
    const heightJobPosts = (jobPostsVal / maxJobPosts) * chartHeight;
    const heightApps = (appsVal / maxApps) * chartHeight;

    const yJobPosts = svgHeight - paddingBottom - heightJobPosts;
    const yApps = svgHeight - paddingBottom - heightApps;

    return {
      xGroupStart,
      xJobPosts,
      xApps,
      yJobPosts,
      yApps,
      heightJobPosts,
      heightApps,
      jobPostsVal,
      appsVal,
      ...t
    };
  });

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  // Grid lines (y ticks)
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm relative group space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Biểu đồ xu hướng tuyển dụng</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">So sánh số tin tuyển dụng đăng mới và hồ sơ ứng tuyển theo ngày</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] font-bold select-none">
          <div className="flex items-center gap-1.5 text-purple-600">
            <span className="w-3 h-3 rounded-[3px] bg-purple-500 inline-block"></span>
            <span>Tin đăng mới</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-3 h-3 rounded-[3px] bg-emerald-500 inline-block"></span>
            <span>Đơn ứng tuyển</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const y = paddingTop + tick * chartHeight;
            return (
              <line
                key={i}
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Left Y Axis Labels (Purple for Job Posts) */}
          <text x={paddingLeft - 8} y={paddingTop + 4} textAnchor="end" className="text-[8px] fill-purple-500 font-bold">
            {maxJobPosts}
          </text>
          <text x={paddingLeft - 8} y={paddingTop + chartHeight / 2 + 4} textAnchor="end" className="text-[8px] fill-purple-400 font-semibold">
            {Math.round(maxJobPosts / 2)}
          </text>
          <text x={paddingLeft - 8} y={svgHeight - paddingBottom + 4} textAnchor="end" className="text-[8px] fill-slate-400 font-semibold">
            0
          </text>

          {/* Right Y Axis Labels (Emerald for Applications) */}
          <text x={svgWidth - paddingRight + 8} y={paddingTop + 4} textAnchor="start" className="text-[8px] fill-emerald-600 font-bold">
            {maxApps}
          </text>
          <text x={svgWidth - paddingRight + 8} y={paddingTop + chartHeight / 2 + 4} textAnchor="start" className="text-[8px] fill-emerald-500 font-semibold">
            {Math.round(maxApps / 2)}
          </text>
          <text x={svgWidth - paddingRight + 8} y={svgHeight - paddingBottom + 4} textAnchor="start" className="text-[8px] fill-slate-400 font-semibold">
            0
          </text>

          {/* Render hover highlight cards under the columns */}
          {bars.map((bar, idx) => (
            <rect
              key={`hover-bg-${idx}`}
              x={bar.xGroupStart}
              y={paddingTop}
              width={groupWidth}
              height={chartHeight}
              fill="#f1f5f9"
              opacity={activeIndex === idx ? 0.5 : 0}
              rx={4}
              pointerEvents="none"
              className="transition-opacity duration-150"
            />
          ))}

          {/* Render Columns */}
          {bars.map((bar, idx) => (
            <g key={`bar-group-${idx}`}>
              {/* Job Posts Column (Purple) */}
              {bar.heightJobPosts > 0 && (
                <rect
                  x={bar.xJobPosts}
                  y={bar.yJobPosts}
                  width={barWidth}
                  height={bar.heightJobPosts}
                  fill="#8b5cf6"
                  rx={1.5}
                  className="transition-all duration-300 hover:opacity-85"
                />
              )}

              {/* Applications Column (Emerald) */}
              {bar.heightApps > 0 && (
                <rect
                  x={bar.xApps}
                  y={bar.yApps}
                  width={barWidth}
                  height={bar.heightApps}
                  fill="#10b981"
                  rx={1.5}
                  className="transition-all duration-300 hover:opacity-85"
                />
              )}
            </g>
          ))}

          {/* Interactive Invisible hover listener overlays */}
          {bars.map((bar, idx) => (
            <rect
              key={`overlay-${idx}`}
              x={bar.xGroupStart}
              y={paddingTop}
              width={groupWidth}
              height={chartHeight + paddingBottom}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          ))}

          {/* X Axis Dates (displaying labels every 6 days or last element) */}
          {bars.map((bar, idx) => {
            if (idx % 6 === 0 || idx === bars.length - 1) {
              return (
                <text
                  key={`date-${idx}`}
                  x={bar.xGroupStart + groupWidth / 2}
                  y={svgHeight - paddingBottom + 16}
                  textAnchor="middle"
                  className="text-[8.5px] fill-slate-400 font-bold"
                >
                  {formatDate(bar.date)}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {activeIndex !== null && bars[activeIndex] && (
          <div
            className="absolute bg-slate-900 text-white px-3 py-2 rounded-[6px] shadow-lg border border-slate-700 pointer-events-none text-[10px] space-y-1 z-10 transition-all font-sans"
            style={{
              left: `${Math.min(
                Math.max(8, (bars[activeIndex].xGroupStart / svgWidth) * 100 - 15),
                82
              )}%`,
              top: "10%",
            }}
          >
            <div className="flex items-center gap-1 font-extrabold border-b border-slate-700 pb-1 mb-1">
              <Calendar size={10} className="text-slate-400" />
              <span>Ngày {bars[activeIndex].date.split("-").reverse().join("/")}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Briefcase size={10} className="text-purple-400" /> Tin tuyển dụng:
              </span>
              <span className="font-extrabold text-purple-300">{bars[activeIndex].jobPostsVal}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <UserCheck size={10} className="text-emerald-400" /> Đơn ứng tuyển:
              </span>
              <span className="font-extrabold text-emerald-300">{bars[activeIndex].appsVal}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
