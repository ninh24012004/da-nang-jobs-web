export default function CandidatePage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Candidate Home (Public)</h1>
            <p className="mt-4">Anyone can see this page.</p>
            <div className="mt-6">
                <a href="/candidate/profile" className="text-green-500 underline">View My Private Profile (Protected)</a>
            </div>
        </div>
    )
}