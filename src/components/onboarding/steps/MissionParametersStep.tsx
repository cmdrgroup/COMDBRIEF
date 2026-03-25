import StepLayout from "../StepLayout";
import DirectiveCard from "../DirectiveCard";
import { THIS_IS_NOT } from "@/data/onboardingContent";

interface Props {
  isCompleted: boolean;
  onAcknowledge: () => void;
  onContinue: () => void;
}

const MissionParametersStep = ({ isCompleted, onAcknowledge, onContinue }: Props) => (
  <StepLayout
    stepNumber={3}
    title='Mission Parameters — "This Is Not"'
    acknowledgmentText='I understand what The Commander\'s Passage is NOT and accept these parameters.'
    isCompleted={isCompleted}
    onAcknowledge={onAcknowledge}
    onContinue={onContinue}
    requireScroll
  >
    {THIS_IS_NOT.map((item, i) => (
      <DirectiveCard key={item.number} number={item.number} title={item.title} description={item.description} delay={i * 80} />
    ))}
  </StepLayout>
);

export default MissionParametersStep;
