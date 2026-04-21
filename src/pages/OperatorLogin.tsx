import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const OperatorLogin = () => {
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Sign in with email + program access code
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: accessCode,
    });

    if (authError) {
      setError("Invalid email or access code. Check the welcome email from CMDR Group.");
      setLoading(false);
      return;
    }

    // Look up operator by email to get their slug
    const { data: operator, error: opError } = await supabase
      .from("operators")
      .select("slug")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (opError || !operator) {
      setError("No deployment record found for this email. Contact your Command Officer.");
      setLoading(false);
      return;
    }

    navigate(`/onboard/${operator.slug}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="classified-strip">
        ⬛ CMDR GROUP — OPERATOR DEPLOYMENT ACCESS
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-6 border-2 border-command-gold rounded-sm flex items-center justify-center">
              <span className="font-heading text-2xl font-bold text-command-gold">C</span>
            </div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-[0.15em] text-steel-white">
              Commander's Briefing
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-grey mt-2">
              Enter your email and the access code from your welcome email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-slate-grey block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-4 py-3 text-sm text-steel-white focus:outline-none focus:border-command-gold transition-colors"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-slate-grey block mb-1">Access Code</label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="From your welcome email"
                className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-4 py-3 text-sm text-steel-white focus:outline-none focus:border-command-gold transition-colors font-mono tracking-widest"
                required
              />
            </div>
            {error && <p className="text-xs text-warning-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-command-gold text-background hover:bg-command-gold/90 transition-colors rounded-sm disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Begin Deployment →"}
            </button>
          </form>
        </div>
      </div>
      <div className="noise-overlay" />
    </div>
  );
};

export default OperatorLogin;
