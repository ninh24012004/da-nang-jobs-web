import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number; // 0-indexed (backend compatibility)
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-6 select-none">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
        disabled={currentPage === 0}
        className="p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: totalPages }).map((_, idx) => {
        const isCurrent = idx === currentPage;
        return (
          <button
            key={idx}
            onClick={() => onPageChange(idx)}
            className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors cursor-pointer ${
              isCurrent
                ? "bg-[#00B14F] border-[#00B14F] text-white shadow-sm"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            {idx + 1}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
        disabled={currentPage === totalPages - 1}
        className="p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
