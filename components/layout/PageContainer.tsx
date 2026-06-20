import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidths = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export default function PageContainer({ children, className, maxWidth = 'lg' }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full', maxWidths[maxWidth], className)}>
      {children}
    </div>
  );
}
