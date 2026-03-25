import { Check } from "lucide-react";
import { STEP_NAMES } from "@/data/onboardingContent";

interface CompletionScreenProps {
  operatorName: string;
  completedSteps: boolean[];
}

const CompletionScreen = ({ operatorName, completedSteps }: CompletionScreenProps) => {
  const now = new Date().toLocaleString("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="classified-strip">
        ⬛ CLASSIFIED — CMDR GROUP — PRE-DEPLOYMENT PROTOCOL
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-lg text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-field-green/20 border-2 border-field-green flex items-center justify-center">
            <Check className="w-10 h-10 text-field-green animate-scale-check" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-[0.15em] text-steel-white mb-2">
            Pre-Deployment Complete
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-command-gold mb-6">
            Awaiting Deployment Call
          </p>
          <p className="text-sm text-steel-white/70 leading-relaxed mb-8">
            Your Command Officer has been notified. Stand by for your deployment call,
            where we will walk through your personalised roadmap and mind clearing charge inventory.
          </p>
          <div className="directive-card text-left mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-slate-grey uppercase tracking-widest">Operator</span>
              <span className="font-heading text-sm text-command-gold uppercase tracking-wider">{operatorName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-grey uppercase tracking-widest">Completed</span>
              <span className="font-mono text-xs text-steel-white/60">{now}</span>
            </div>
          </div>
          <div className="directive-card text-left">
            <h3 className="font-heading text-xs uppercase tracking-wider text-command-gold mb-3">Steps Completed</h3>
            <div className="space-y-1.5">
              {STEP_NAMES.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                    completedSteps[i] ? "bg-field-green" : "bg-gunmetal"
                  }`}>
                    {completedSteps[i] && <Check className="w-2.5 h-2.5 text-steel-white" />}
                  </div>
                  <span className="text-xs text-steel-white/60">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="noise-overlay" />
    </div>
  );
};

export default CompletionScreen;
