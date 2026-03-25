import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CommandLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    navigate("/command");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="classified-strip">
        ⬛ CLASSIFIED — CMDR GROUP — COMMAND ACCESS
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-6 border-2 border-command-gold rounded-sm flex items-center justify-center">
              <span className="font-heading text-2xl font-bold text-command-gold">C</span>
            </div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-[0.15em] text-steel-white">
              Command Access
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-grey mt-2">
              Authorized Personnel Only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-slate-grey block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-4 py-3 text-sm text-steel-white focus:outline-none focus:border-command-gold transition-colors"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-widest text-slate-grey block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-tactical-steel border border-gunmetal rounded-sm px-4 py-3 text-sm text-steel-white focus:outline-none focus:border-command-gold transition-colors"
                required
              />
            </div>
            {error && <p className="text-xs text-warning-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-warning-red text-steel-white hover:bg-warning-red/90 transition-colors rounded-sm disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Dashboard →"}
            </button>
          </form>
        </div>
      </div>
      <div className="noise-overlay" />
    </div>
  );
};

export default CommandLogin;
