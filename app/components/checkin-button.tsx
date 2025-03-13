'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckinButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export default function CheckinButton({ onClick, isLoading, isDisabled }: CheckinButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      onClick={onClick}
      disabled={isLoading || isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      size="lg"
      className={cn(
        'relative px-8 py-6 h-auto min-w-44 text-base',
        isHovered && !isDisabled && 'scale-105 transition-transform duration-300'
      )}
      variant={isDisabled ? 'secondary' : 'default'}
    >
      <div className={cn('flex items-center justify-center gap-2', isLoading && 'opacity-0')}>
        <span>{isDisabled ? 'Already Checked In' : 'Check In Now'}</span>
        {!isDisabled && <Check className="h-5 w-5" />}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Checking in...</span>
        </div>
      )}

      {/* Background shine effect on hover */}
      {!isDisabled && (
        <div
          className={cn(
            'absolute inset-0 rounded-md overflow-hidden',
            isHovered ? 'opacity-100' : 'opacity-0',
            'transition-opacity duration-300'
          )}
        >
          <div className="absolute top-0 bottom-0 -left-10 w-20 bg-white opacity-10 transform rotate-12 transition-transform duration-1000 translate-x-0 skew-x-12"></div>
        </div>
      )}
    </Button>
  );
}
