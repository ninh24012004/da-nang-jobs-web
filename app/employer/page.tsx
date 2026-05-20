export default function EmployerPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Employer Landing Page</h1>
            <p className="mt-4">This page is PUBLIC for guests, but RESTRICTED for logged-in Candidates/Admins.</p>
            <div className="mt-6">
                <a href="/employer/dashboard" className="text-blue-500 underline">Go to Dashboard (Protected)</a>
            </div>
        </div>
    )
}