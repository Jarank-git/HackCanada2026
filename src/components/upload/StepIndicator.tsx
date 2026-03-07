interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={label} className="step-indicator-item">
            {i > 0 && (
              <div
                className={`step-connector${isCompleted || isActive ? ' step-connector--filled' : ''}`}
              />
            )}
            <div
              className={`step-circle${
                isCompleted
                  ? ' step-circle--completed'
                  : isActive
                    ? ' step-circle--active'
                    : ' step-circle--upcoming'
              }`}
            >
              {isCompleted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                stepNum
              )}
            </div>
            <span
              className={`step-label${
                isActive ? ' step-label--active' : isCompleted ? ' step-label--completed' : ''
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
