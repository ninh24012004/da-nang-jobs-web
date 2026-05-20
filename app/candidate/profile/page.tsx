export default function CandidateProfile() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-green-600">Candidate Profile</h1>
            <p className="mt-4">This is your private profile page.</p>
            <div className="mt-6 p-4 bg-gray-100 rounded">
                <p>This page is RESTRICTED (Candidate Only).</p>
            </div>
        </div>
    )
}
