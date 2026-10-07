import { Link, Navigate, useLocation } from "react-router-dom";

export default function RegistrationReceipt() {
  const { state } = useLocation();
  if (!state) return <Navigate to="/register" replace />;
  const participants = Array.isArray(state.participants) ? state.participants : [];

  return (
    <main className="ui-page receipt-page text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="ui-panel p-6 sm:p-8 space-y-3">
          <p className="text-cyan-300 text-xs font-bold uppercase tracking-widest">Registration received</p>
          <h1 className="text-3xl font-bold">Your participant IDs</h1>
          <p className="text-ui-muted text-sm">Save these IDs for event check-in. NITW participants use their roll numbers.</p>
          <p className="text-ui-muted text-sm">Check {state.verifyEmail || "your email"} for your account verification link.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {participants.map((participant) => (
            <article key={participant.participantId} className="ui-panel p-5 space-y-3">
              <h2 className="font-bold text-lg break-words">{participant.name}</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-ui-muted">Participant ID</dt>
                  <dd className="font-sans text-cyan-300 font-bold break-all select-all">{participant.participantId}</dd>
                </div>
                {participant.studentType === "nitw" && (
                  <div>
                    <dt className="text-ui-muted">NITW roll number</dt>
                    <dd className="font-sans break-all">{participant.rollNumber}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
        {participants.length === 0 && <p className="text-ui-muted">Your participant IDs are not available. Please contact the organizers.</p>}
        <Link to="/" className="ui-button ui-button-primary">Back to Home</Link>
      </div>
    </main>
  );
}
