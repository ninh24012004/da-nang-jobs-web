import { ReactNode, ComponentType } from "react";
import { SlidersHorizontal } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionButton?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
}

export default function EmptyState({ title, description, actionButton, icon: Icon = SlidersHorizontal }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg border border-dashed border-slate-300 py-16 px-6 text-center space-y-4">
      <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center mx-auto text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="font-bold text-slate-800 text-base">{title}</h3>
        <p className="text-xs text-slate-500 leading-normal">{description}</p>
      </div>
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
}
