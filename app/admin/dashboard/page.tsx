export default function AdminDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-red-600">Admin Dashboard</h1>
            <p className="mt-4">Welcome, Super Admin! You are the only one who can see this.</p>
            <div className="mt-6 p-4 bg-gray-100 rounded">
                <p>This page is protected by Middleware (Admin Only).</p>
            </div>
        </div>
    )
}
