import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="classified-strip">
        ⬛ CLASSIFIED — CMDR GROUP — PRE-DEPLOYMENT PROTOCOL
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center animate-fade-in-up max-w-lg">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-command-gold rounded-sm flex items-center justify-center">
            <span className="font-heading text-2xl font-bold text-command-gold">C</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-[0.15em] text-steel-white mb-3">
            The Commander's Passage
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-command-gold mb-6">
            Pre-Deployment Protocol
          </p>
          <p className="text-sm text-steel-white/70 leading-relaxed mb-8">
            Welcome, Operator. Use the access code from your welcome email to begin your deployment.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full px-8 py-3.5 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-command-gold text-background hover:bg-command-gold/90 transition-colors rounded-sm"
            >
              Begin Deployment →
            </button>
            <button
              onClick={() => navigate("/command/login")}
              className="w-full px-8 py-3 font-heading text-xs uppercase tracking-[0.2em] font-bold border border-gunmetal text-slate-grey hover:border-command-gold hover:text-command-gold transition-colors rounded-sm"
            >
              Command Access →
            </button>
          </div>
        </div>
      </div>
      <div className="noise-overlay" />
    </div>
  );
};

export default Index;
