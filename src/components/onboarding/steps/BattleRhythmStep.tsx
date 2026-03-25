import StepLayout from "../StepLayout";
import { DAILY_OPERATIONS, BATTLE_RHYTHM, SITREP_STRUCTURE } from "@/data/onboardingContent";

interface Props {
  isCompleted: boolean;
  onAcknowledge: () => void;
  onContinue: () => void;
}

const BattleRhythmStep = ({ isCompleted, onAcknowledge, onContinue }: Props) => (
  <StepLayout
    stepNumber={7}
    title="Daily Battle Rhythm"
    acknowledgmentText="I commit to establishing and maintaining my Daily Battle Rhythm."
    isCompleted={isCompleted}
    onAcknowledge={onAcknowledge}
    onContinue={onContinue}
    requireScroll
  >
    <div className="directive-card animate-fade-in-up">
      <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-command-gold mb-4">
        Core Daily Operations
      </h3>
      <div className="space-y-3">
        {DAILY_OPERATIONS.map((op, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="font-mono text-xs text-command-gold shrink-0 mt-0.5 w-16">{op.time}</span>
            <p className="text-sm text-steel-white/70 leading-relaxed">{op.action}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="directive-card animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-command-gold mb-4">
        Battle Rhythm Deployment Schedule
      </h3>
      <div className="space-y-1">
        {BATTLE_RHYTHM.map((entry, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 py-2 px-3 rounded-sm ${
              entry.phase === "morning"
                ? "bg-command-gold/5"
                : entry.phase === "work"
                ? "bg-warning-red/5"
                : entry.phase === "midday"
                ? "bg-slate-grey/5"
                : "bg-field-green/10"
            }`}
          >
            <span className="font-mono text-xs text-command-gold shrink-0 mt-0.5 w-24">{entry.time}</span>
            <p className="text-sm text-steel-white/70 leading-relaxed">{entry.activity}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="directive-card animate-fade-in-up" style={{ animationDelay: "200ms" }}>
      <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-command-gold mb-4">
        Daily SITREP Structure
      </h3>
      <div className="space-y-2 font-mono text-xs">
        {SITREP_STRUCTURE.map((line, i) => (
          <p key={i} className="text-steel-white/60">{line}</p>
        ))}
      </div>
    </div>
  </StepLayout>
);

export default BattleRhythmStep;
