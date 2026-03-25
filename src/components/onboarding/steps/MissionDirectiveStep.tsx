import StepLayout from "../StepLayout";
import { MISSION_DIRECTIVE } from "@/data/onboardingContent";

interface Props {
  isCompleted: boolean;
  onAcknowledge: () => void;
  onContinue: () => void;
}

const MissionDirectiveStep = ({ isCompleted, onAcknowledge, onContinue }: Props) => (
  <StepLayout
    stepNumber={1}
    title="Mission Directive"
    acknowledgmentText="I have read and understand the Mission Directive and classification requirements."
    isCompleted={isCompleted}
    onAcknowledge={onAcknowledge}
    onContinue={onContinue}
    requireScroll
  >
    <div className="directive-card animate-fade-in-up">
      {MISSION_DIRECTIVE.content.split("\n\n").map((paragraph, i) => (
        <p key={i} className="text-sm text-steel-white/80 leading-relaxed mb-4 last:mb-0">
          {paragraph}
        </p>
      ))}
    </div>
  </StepLayout>
);

export default MissionDirectiveStep;
