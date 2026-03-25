import { useState } from "react";
import { Check } from "lucide-react";
import { STEP_NAMES } from "@/data/onboardingContent";

interface SignatureStepProps {
  completedSteps: boolean[];
  onSign: (name: string) => void;
}

const SignatureStep = ({ completedSteps, onSign }: SignatureStepProps) => {
  const [signatureName, setSignatureName] = useState("");
  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const canSign = signatureName.trim().length > 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-8 pb-4 max-w-4xl mx-auto w-full">
        <span className="step-label">STEP 08</span>
        <h2 className="section-header mt-2">Command Authorization</h2>
      </div>

      <div className="flex-1 px-6 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-sm text-steel-white/70 leading-relaxed">
            You have reviewed and acknowledged all pre-deployment directives. By signing below,
            you confirm your readiness to commence The Commander's Passage.
          </p>

          <div className="directive-card animate-fade-in-up">
            <h3 className="font-heading text-sm uppercase tracking-wider text-command-gold mb-4">
              Completion Summary
            </h3>
            <div className="space-y-2">
              {STEP_NAMES.slice(0, 8).map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-sm flex items-center justify-center ${
                    completedSteps[i] ? "bg-field-green" : "bg-gunmetal"
                  }`}>
                    {completedSteps[i] && <Check className="w-3 h-3 text-steel-white" />}
                  </div>
                  <span className="text-sm text-steel-white/70">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="directive-card animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <label className="block mb-2">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-grey">
                Type your full name to authorize
              </span>
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              className="w-full bg-background border border-gunmetal rounded-sm px-4 py-3 text-steel-white font-heading text-lg tracking-wider focus:outline-none focus:border-command-gold transition-colors"
              placeholder="FULL NAME"
            />
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-xs text-slate-grey uppercase tracking-widest">Date:</span>
              <span className="font-mono text-xs text-steel-white/60">{today}</span>
            </div>
          </div>

          <button
            onClick={() => canSign && onSign(signatureName.trim())}
            disabled={!canSign}
            className={`w-full py-4 font-heading text-sm uppercase tracking-[0.2em] font-bold rounded-sm transition-all ${
              canSign
                ? "bg-warning-red text-steel-white hover:bg-warning-red/90 cursor-pointer"
                : "bg-gunmetal text-slate-grey cursor-not-allowed"
            }`}
          >
            Authorize & Complete Pre-Deployment →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureStep;
