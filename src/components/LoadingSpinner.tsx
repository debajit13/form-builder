interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'white' | 'green' | 'red';
  className?: string;
  text?: string;
  inline?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  color = 'blue',
  className = '',
  text,
  inline = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white',
    green: 'border-green-600',
    red: 'border-red-600'
  };

  const spinnerElement = (
    <div
      className={`animate-spin rounded-full border-2 border-transparent ${
        sizeClasses[size]
      } ${colorClasses[color]} border-t-current border-r-current ${className}`}
      role="status"
      aria-label={text || 'Loading'}
    >
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        {spinnerElement}
        {text && <span className="text-sm text-gray-600">{text}</span>}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinnerElement}
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
}

export function LoadingSkeleton({
  lines = 3,
  className = '',
  height = 'h-4'
}: {
  lines?: number;
  className?: string;
  height?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 rounded shimmer`}
          style={{
            width: index === lines - 1 ? '75%' : '100%'
          }}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}

export function LoadingCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`} role="status" aria-label="Loading card">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded shimmer w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded shimmer" />
          <div className="h-4 bg-gray-200 rounded shimmer w-5/6" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-200 rounded shimmer w-20" />
          <div className="h-8 bg-gray-200 rounded shimmer w-16" />
        </div>
      </div>
      <span className="sr-only">Loading card content...</span>
    </div>
  );
}