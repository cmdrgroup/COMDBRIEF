import StepLayout from "../StepLayout";
import { COMMAND_CENTERS } from "@/data/onboardingContent";

interface Props {
  isCompleted: boolean;
  onAcknowledge: () => void;
  onContinue: () => void;
}

const CenterOfGravityStep = ({ isCompleted, onAcknowledge, onContinue }: Props) => (
  <StepLayout
    stepNumber={5}
    title="Center of Gravity — Strategic Command Centers"
    acknowledgmentText="I understand the five pillars of Command and commit to protecting my Center of Gravity."
    isCompleted={isCompleted}
    onAcknowledge={onAcknowledge}
    onContinue={onContinue}
    requireScroll
  >
    {COMMAND_CENTERS.map((cc, i) => (
      <div
        key={cc.name}
        className="directive-card animate-fade-in-up"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-sm bg-command-gold/10 border border-command-gold/30 flex items-center justify-center shrink-0">
            <span className="font-heading text-sm font-bold text-command-gold">{cc.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-command-gold mb-1">{cc.name}</h3>
            <p className="font-mono text-xs text-slate-grey uppercase tracking-wider mb-2">{cc.tactical}</p>
            <p className="text-sm text-steel-white/70 leading-relaxed">{cc.operational}</p>
          </div>
        </div>
      </div>
    ))}
  </StepLayout>
);

export default CenterOfGravityStep;
