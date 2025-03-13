import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface StatusAlertProps {
  status: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  className?: string;
}

export function StatusAlert({ status, title, description, className }: StatusAlertProps) {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: Info,
    info: Info,
  };

  const Icon = icons[status];

  const variants = {
    success: 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400',
    error: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400',
    warning: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    info: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  };

  return (
    <Alert className={cn(variants[status], className)}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
