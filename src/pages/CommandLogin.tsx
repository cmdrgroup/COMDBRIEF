import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CommandLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (isSignup) {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/#/command/login" },
      });
      if (signupError) {
        setError(signupError.message);
      } else {
        setSuccess("Check your email to confirm your account, then log in.");
        setIsSignup(false);
      }
      setLoading(false);
      return;
    }

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
              {isSignup ? "Create Account" : "Command Access"}
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-grey mt-2">
              Authorized Personnel Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                minLength={6}
              />
            </div>
            {error && <p className="text-xs text-warning-red">{error}</p>}
            {success && <p className="text-xs text-field-green">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-heading text-sm uppercase tracking-[0.2em] font-bold bg-warning-red text-steel-white hover:bg-warning-red/90 transition-colors rounded-sm disabled:opacity-50"
            >
              {loading
                ? isSignup ? "Creating Account..." : "Authenticating..."
                : isSignup ? "Create Account →" : "Access Dashboard →"}
            </button>
          </form>

          <button
            onClick={() => { setIsSignup(!isSignup); setError(""); setSuccess(""); }}
            className="w-full mt-4 py-2 font-mono text-xs uppercase tracking-widest text-slate-grey hover:text-command-gold transition-colors"
          >
            {isSignup ? "Already have an account? Log in" : "Need an account? Sign up"}
          </button>
        </div>
      </div>
      <div className="noise-overlay" />
    </div>
  );
};

export default CommandLogin;
