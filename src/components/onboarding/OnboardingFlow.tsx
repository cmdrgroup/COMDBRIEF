import { useState, useCallback, useEffect } from "react";
import StepProgress from "./StepProgress";
import WelcomeStep from "./steps/WelcomeStep";
import MissionDirectiveStep from "./steps/MissionDirectiveStep";
import RulesOfEngagementStep from "./steps/RulesOfEngagementStep";
import MissionParametersStep from "./steps/MissionParametersStep";
import FailurePointsStep from "./steps/FailurePointsStep";
import CenterOfGravityStep from "./steps/CenterOfGravityStep";
import MindClearingStep from "./steps/MindClearingStep";
import CommunicationsStep from "./steps/CommunicationsStep";
import BattleRhythmStep from "./steps/BattleRhythmStep";
import SignatureStep from "./steps/SignatureStep";
import CompletionScreen from "./steps/CompletionScreen";

interface OnboardingFlowProps {
  operatorName: string;
  operatorId: string;
  initialStep?: number;
  initialCompleted?: boolean[];
  onStepComplete?: (step: number) => void;
  onSignature?: (name: string) => void;
}

const TOTAL_STEPS = 10;

const OnboardingFlow = ({
  operatorName,
  operatorId,
  initialStep = 0,
  initialCompleted = new Array(TOTAL_STEPS).fill(false),
  onStepComplete,
  onSignature,
}: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState(initialCompleted);
  const allComplete = initialCompleted.every(Boolean);
  const [showCompletion, setShowCompletion] = useState(allComplete);

  // Warn before closing if onboarding is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!showCompletion && completedSteps.some(Boolean) && !completedSteps.every(Boolean)) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [showCompletion, completedSteps]);

  const handleAcknowledge = useCallback(
    (step: number) => {
      const updated = [...completedSteps];
      updated[step] = true;
      setCompletedSteps(updated);
      onStepComplete?.(step);
    },
    [completedSteps, onStepComplete]
  );

  const handleContinue = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowCompletion(true);
    }
  }, [currentStep]);

  const handleSignature = useCallback(
    (name: string) => {
      handleAcknowledge(TOTAL_STEPS - 1);
      onSignature?.(name);
      setShowCompletion(true);
    },
    [handleAcknowledge, onSignature]
  );

  if (showCompletion) {
    return <CompletionScreen operatorName={operatorName} completedSteps={completedSteps} />;
  }

  const stepProps = {
    isCompleted: completedSteps[currentStep],
    onAcknowledge: () => handleAcknowledge(currentStep),
    onContinue: handleContinue,
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <WelcomeStep operatorName={operatorName} onContinue={handleContinue} isCompleted={completedSteps[0]} onAcknowledge={() => handleAcknowledge(0)} />;
      case 1: return <MissionDirectiveStep {...stepProps} />;
      case 2: return <RulesOfEngagementStep {...stepProps} />;
      case 3: return <MissionParametersStep {...stepProps} />;
      case 4: return <FailurePointsStep {...stepProps} />;
      case 5: return <CenterOfGravityStep {...stepProps} />;
      case 6: return <MindClearingStep operatorId={operatorId} {...stepProps} />;
      case 7: return <CommunicationsStep {...stepProps} />;
      case 8: return <BattleRhythmStep {...stepProps} />;
      case 9: return <SignatureStep completedSteps={completedSteps} onSign={handleSignature} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="classified-strip">
        ⬛ CLASSIFIED — CMDR GROUP — PRE-DEPLOYMENT PROTOCOL
      </div>
      <StepProgress currentStep={currentStep} completedSteps={completedSteps} />
      <div className="flex-1 overflow-hidden">
        {renderStep()}
      </div>
      <div className="noise-overlay" />
    </div>
  );
};

export default OnboardingFlow;
