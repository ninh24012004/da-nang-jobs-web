import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen bg-white flex overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
                <AdminHeader />
                <main className="px-7 py-6 bg-[#F8FAFC] flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
