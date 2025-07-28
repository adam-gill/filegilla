interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'max';
  speed?: 'slow' | 'normal' | 'fast' | 'fastest';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  speed = 'normal',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    max: 'w-[200px] h-[200px] border-6'
  };

  const speedClasses = {
    slow: 'spin-slow',
    normal: 'spin',
    fast: 'spin-fast',
    fastest: 'spin-very-fast'
  };

  return (
    <div 
      className={`
        border-2 border-gray-300 border-t-[#60a5fa] 
        rounded-full 
        ${sizeClasses[size]} 
        ${speedClasses[speed]}
        ${className}
      `}
    />
  );
} 