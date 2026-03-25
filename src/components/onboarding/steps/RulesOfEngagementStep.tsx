import StepLayout from "../StepLayout";
import DirectiveCard from "../DirectiveCard";
import { OPERATIONAL_DIRECTIVES } from "@/data/onboardingContent";

interface Props {
  isCompleted: boolean;
  onAcknowledge: () => void;
  onContinue: () => void;
}

const RulesOfEngagementStep = ({ isCompleted, onAcknowledge, onContinue }: Props) => (
  <StepLayout
    stepNumber={2}
    title="Rules of Engagement"
    acknowledgmentText="I commit to these Rules of Engagement and accept them as my operational standard."
    isCompleted={isCompleted}
    onAcknowledge={onAcknowledge}
    onContinue={onContinue}
    requireScroll
  >
    {OPERATIONAL_DIRECTIVES.map((d, i) => (
      <DirectiveCard key={d.number} number={d.number} title={d.title} description={d.description} delay={i * 80} />
    ))}
  </StepLayout>
);

export default RulesOfEngagementStep;
