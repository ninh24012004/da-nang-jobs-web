export default function EmployerDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-blue-600">Employer Dashboard</h1>
            <p className="mt-4">Welcome, Employer! Manage your job postings here.</p>
            <div className="mt-6 p-4 bg-gray-100 rounded">
                <p>This page is protected by Middleware (Employer Only when logged in).</p>
            </div>
        </div>
    )
}
