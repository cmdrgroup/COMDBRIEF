import StepLayout from "../StepLayout";
import { FAILURE_POINTS } from "@/data/onboardingContent";

interface Props {
  isCompleted: boolean;
  onAcknowledge: () => void;
  onContinue: () => void;
}

const FailurePointsStep = ({ isCompleted, onAcknowledge, onContinue }: Props) => (
  <StepLayout
    stepNumber={4}
    title="Mission Failure Points"
    acknowledgmentText="I acknowledge these failure points and take full responsibility for my execution."
    isCompleted={isCompleted}
    onAcknowledge={onAcknowledge}
    onContinue={onContinue}
    requireScroll
  >
    {FAILURE_POINTS.map((fp, i) => (
      <div
        key={fp.number}
        className="directive-card-danger animate-fade-in-up"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        <div className="flex items-start gap-4">
          <span className="font-mono text-warning-red text-sm font-bold mt-0.5 shrink-0">
            {String(fp.number).padStart(2, "0")}
          </span>
          <p className="text-sm text-steel-white/80 leading-relaxed">{fp.text}</p>
        </div>
      </div>
    ))}
  </StepLayout>
);

export default FailurePointsStep;
