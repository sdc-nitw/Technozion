import { Link, Navigate, useLocation } from "react-router-dom";

export default function RegistrationReceipt() {
  const { state } = useLocation();
  if (!state) return <Navigate to="/register" replace />;
  const participants = Array.isArray(state.participants) ? state.participants : [];

  return (
    <main className="min-h-screen bg-[#020928] text-white px-4 pt-28 pb-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-2xl bg-[#18202c] border border-cyan-400/30 p-6 sm:p-8 space-y-3">
          <p className="text-cyan-300 text-xs font-bold uppercase tracking-widest">Registration received</p>
          <h1 className="text-3xl font-bold">Your participant IDs</h1>
          <p className="text-neutral-300 text-sm">Save these IDs for event check-in. NITW participants use their roll numbers.</p>
          <p className="text-neutral-300 text-sm">Check {state.verifyEmail || "your email"} for your account verification link.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {participants.map((participant) => (
            <article key={participant.participantId} className="rounded-xl bg-[#18202c] border border-[#395563] p-5 space-y-3">
              <h2 className="font-bold text-lg break-words">{participant.name}</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-neutral-400">Participant ID</dt>
                  <dd className="font-mono text-cyan-300 font-bold break-all select-all">{participant.participantId}</dd>
                </div>
                {participant.studentType === "nitw" && (
                  <div>
                    <dt className="text-neutral-400">NITW roll number</dt>
                    <dd className="font-mono break-all">{participant.rollNumber}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
        {participants.length === 0 && <p className="text-neutral-300">Your participant IDs are not available. Please contact the organizers.</p>}
        <Link to="/" className="inline-block rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3">Back to Home</Link>
      </div>
    </main>
  );
}
