import { useState, Suspense } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen bg-slate-50 flex overflow-hidden">
            {/* Backdrop overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Suspense fallback={<div className="hidden lg:block w-64 h-full bg-slate-900" />}>
                <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </Suspense>

            <div className="flex-1 flex flex-col h-screen overflow-hidden lg:pl-64">
                <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
                <main className="p-6 bg-slate-50 flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}

