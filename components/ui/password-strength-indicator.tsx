import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/utils/global';
import { passwordRequirements } from '@/app/(auth)/signup/SignUpFormSchema';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const getStrengthScore = () => {
    return passwordRequirements.reduce((score, requirement) => {
      return requirement.regex.test(password) ? score + 1 : score;
    }, 0);
  };

  const strengthScore = getStrengthScore();
  const strengthPercentage = (strengthScore / passwordRequirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'bg-red-500';
    if (strengthScore <= 3) return 'bg-yellow-500';
    if (strengthScore <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore <= 3) return 'Fair';
    if (strengthScore <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className={cn('space-y-3 p-3 bg-muted/30 rounded-md border', className)}>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">Password Strength</span>
          <span className={cn(
            'font-semibold transition-colors',
            strengthScore <= 2 && 'text-red-500',
            strengthScore === 3 && 'text-yellow-500',
            strengthScore === 4 && 'text-blue-500',
            strengthScore === 5 && 'text-green-500'
          )}>
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={cn('h-2 rounded-full transition-all duration-500 ease-out', getStrengthColor())}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground font-medium mb-2">Password must contain:</p>
        {passwordRequirements.map((requirement, index) => {
          const isValid = requirement.regex.test(password);
          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2 text-xs transition-all duration-200',
                isValid ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'flex-shrink-0 rounded-full p-0.5 transition-colors',
                isValid ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
              )}>
                {isValid ? (
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <span className={cn(isValid && 'line-through opacity-75')}>{requirement.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
