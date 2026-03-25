import StepLayout from "../StepLayout";
import { SUPPORT_HIERARCHY, COMMUNICATION_FRAMEWORKS } from "@/data/onboardingContent";

interface Props {
  isCompleted: boolean;
  onAcknowledge: () => void;
  onContinue: () => void;
}

const CommunicationsStep = ({ isCompleted, onAcknowledge, onContinue }: Props) => (
  <StepLayout
    stepNumber={6}
    title="Support & Communications Protocol"
    acknowledgmentText="I understand the communication protocols and will follow the correct escalation hierarchy."
    isCompleted={isCompleted}
    onAcknowledge={onAcknowledge}
    onContinue={onContinue}
    requireScroll
  >
    <div className="directive-card animate-fade-in-up">
      <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-command-gold mb-4">
        Support Protocol Hierarchy
      </h3>
      <div className="space-y-3">
        {SUPPORT_HIERARCHY.map((item) => (
          <div key={item.step} className="flex items-start gap-3">
            <span className="font-mono text-command-gold text-sm font-bold shrink-0">
              {String(item.step).padStart(2, "0")}
            </span>
            <p className="text-sm text-steel-white/70 leading-relaxed">{item.action}</p>
          </div>
        ))}
      </div>
    </div>

    {COMMUNICATION_FRAMEWORKS.map((fw, i) => (
      <div
        key={fw.name}
        className="directive-card animate-fade-in-up"
        style={{ animationDelay: `${(i + 1) * 100}ms` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-xs px-2 py-1 bg-command-gold/10 text-command-gold border border-command-gold/30 rounded-sm">
            {fw.name}
          </span>
          <span className="font-heading text-sm uppercase tracking-wider text-steel-white">{fw.fullName}</span>
        </div>
        <p className="text-xs text-slate-grey mb-3">{fw.description}</p>
        <div className="space-y-2">
          {fw.structure.map((item, j) => (
            <div key={j} className="flex items-start gap-2">
              <span className="text-command-gold text-xs mt-1">▸</span>
              <p className="text-sm text-steel-white/70">{item}</p>
            </div>
          ))}
        </div>
      </div>
    ))}
  </StepLayout>
);

export default CommunicationsStep;
