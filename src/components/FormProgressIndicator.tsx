interface FormStep {
  sectionId: string;
  title: string;
  fields: number;
}

interface FormProgressIndicatorProps {
  steps: FormStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  variant?: 'light' | 'dark';
  showFieldCount?: boolean;
}

export function FormProgressIndicator({
  steps,
  currentStep,
  onStepClick,
  variant = 'dark',
  showFieldCount = false
}: FormProgressIndicatorProps) {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepClasses = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const baseClasses = 'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-all duration-200';

    if (variant === 'light') {
      switch (status) {
        case 'completed':
          return `${baseClasses} bg-green-600 border-green-600 text-white`;
        case 'current':
          return `${baseClasses} bg-blue-600 border-blue-600 text-white ring-4 ring-blue-200`;
        case 'upcoming':
          return `${baseClasses} bg-white border-gray-300 text-gray-500`;
      }
    } else {
      switch (status) {
        case 'completed':
          return `${baseClasses} bg-green-500 border-green-500 text-white shadow-lg`;
        case 'current':
          return `${baseClasses} bg-white border-white text-blue-600 ring-4 ring-white/30 shadow-lg`;
        case 'upcoming':
          return `${baseClasses} bg-white/20 border-white/40 text-white backdrop-blur-sm`;
      }
    }
  };

  const getConnectorClasses = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const baseClasses = 'flex-1 h-0.5 transition-colors duration-200';

    if (variant === 'light') {
      return `${baseClasses} ${status === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`;
    } else {
      return `${baseClasses} ${status === 'completed' ? 'bg-green-400' : 'bg-blue-300'}`;
    }
  };

  const getLabelClasses = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const baseClasses = 'text-sm font-semibold transition-colors duration-200 drop-shadow-sm';

    if (variant === 'light') {
      switch (status) {
        case 'completed':
          return `${baseClasses} text-green-600`;
        case 'current':
          return `${baseClasses} text-blue-600`;
        case 'upcoming':
          return `${baseClasses} text-gray-500`;
      }
    } else {
      switch (status) {
        case 'completed':
          return `${baseClasses} text-gray-900 font-bold`;
        case 'current':
          return `${baseClasses} text-gray-900 font-bold`;
        case 'upcoming':
          return `${baseClasses} text-gray-800 font-semibold`;
      }
    }
  };

  if (steps.length <= 1) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="flex items-center mb-4">
        {steps.map((step, index) => (
          <div key={step.sectionId} className="flex items-center flex-1">
            {/* Step Circle */}
            <button
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              className={`${getStepClasses(index)} ${
                onStepClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'
              } flex-shrink-0`}
              aria-label={`Step ${index + 1}: ${step.title}`}
            >
              {getStepStatus(index) === 'completed' ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`${getConnectorClasses(index)} mx-2`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex">
        {steps.map((step, index) => (
          <div key={`${step.sectionId}-label`} className="flex-1 text-center">
            <div className={getLabelClasses(index)}>
              {step.title}
            </div>
            {showFieldCount && (
              <div
                className={`text-xs mt-1 ${
                  variant === 'light' ? 'text-gray-500' : 'text-gray-800 font-semibold'
                }`}
              >
                {step.fields} field{step.fields !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Percentage */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className={variant === 'light' ? 'text-gray-600' : 'text-gray-900 font-bold'}>
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className={variant === 'light' ? 'text-gray-600' : 'text-gray-900 font-bold'}>
          {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className={`mt-2 w-full rounded-full h-2 ${variant === 'light' ? 'bg-gray-200' : 'bg-white/20 backdrop-blur-sm'}`}>
        <div
          className="h-2 rounded-full transition-all duration-300 ease-out shadow-sm"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            backgroundColor: variant === 'light' ? '#059669' : '#ffffff'
          }}
        />
      </div>
    </div>
  );
}