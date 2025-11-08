interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ message = "Carregando...", size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-blue-500 animate-spin"></div>
      </div>
      
      <p className="text-blue-500 font-medium animate-pulse">{message}</p>
    </div>
  );
}