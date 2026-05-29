"use client";

import { useState, useCallback } from "react";
import { dashboardService } from "@/services/dashboardService";
import { DashboardSummaryResponse, DailyTrendResponse } from "@/types/dashboard";
import { toast } from "sonner";

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [trends, setTrends] = useState<DailyTrendResponse[]>([]);
  
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isTrendsLoading, setIsTrendsLoading] = useState(false);
  
  const [summaryError, setSummaryError] = useState("");
  const [trendsError, setTrendsError] = useState("");

  const fetchSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    setSummaryError("");
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Lỗi khi tải thông tin tổng quan dashboard";
      setSummaryError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const fetchTrends = useCallback(async (days: number = 30) => {
    setIsTrendsLoading(true);
    setTrendsError("");
    try {
      const data = await dashboardService.getTrends(days);
      setTrends(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Lỗi khi tải xu hướng hoạt động";
      setTrendsError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsTrendsLoading(false);
    }
  }, []);

  return {
    summary,
    trends,
    isSummaryLoading,
    isTrendsLoading,
    summaryError,
    trendsError,
    fetchSummary,
    fetchTrends,
  };
}
