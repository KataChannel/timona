'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  showInput?: boolean;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
  size = 'md',
  disabled = false,
  loading = false,
  showInput = true,
  className,
}: QuantitySelectorProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleIncrement = () => {
    const newValue = Math.min(localValue + step, max);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(localValue - step, min);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input for editing
    if (inputValue === '') {
      setLocalValue(min);
      return;
    }

    const numValue = parseInt(inputValue, 10);
    
    if (isNaN(numValue)) return;

    // Clamp value between min and max
    const clampedValue = Math.min(Math.max(numValue, min), max);
    setLocalValue(clampedValue);
  };

  const handleInputBlur = () => {
    // Ensure value is within bounds when input loses focus
    const clampedValue = Math.min(Math.max(localValue, min), max);
    setLocalValue(clampedValue);
    onChange(clampedValue);
  };

  const sizeClasses = {
    sm: {
      button: 'h-7 w-7',
      input: 'h-7 w-12 text-sm',
      icon: 'h-3 w-3',
    },
    md: {
      button: 'h-9 w-9',
      input: 'h-9 w-14 text-base',
      icon: 'h-4 w-4',
    },
    lg: {
      button: 'h-11 w-11',
      input: 'h-11 w-16 text-lg',
      icon: 'h-5 w-5',
    },
  };

  const classes = sizeClasses[size];

  const isMinDisabled = localValue <= min || disabled || loading;
  const isMaxDisabled = localValue >= max || disabled || loading;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Decrease Button */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(classes.button, 'flex-shrink-0')}
        onClick={handleDecrement}
        disabled={isMinDisabled}
        aria-label="Giảm số lượng"
      >
        <Minus className={classes.icon} />
      </Button>

      {/* Quantity Input or Display */}
      {showInput ? (
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled || loading}
          className={cn(
            classes.input,
            'text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            loading && 'opacity-50'
          )}
          aria-label="Số lượng"
        />
      ) : (
        <div
          className={cn(
            classes.input,
            'flex items-center justify-center font-medium border border-input bg-background rounded-md',
            loading && 'opacity-50'
          )}
        >
          {localValue}
        </div>
      )}

      {/* Increase Button */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(classes.button, 'flex-shrink-0')}
        onClick={handleIncrement}
        disabled={isMaxDisabled}
        aria-label="Tăng số lượng"
      >
        <Plus className={classes.icon} />
      </Button>

      {/* Stock Warning */}
      {max < 999 && localValue >= max && (
        <span className="text-xs text-amber-600 ml-2 whitespace-nowrap">
          Tối đa: {max}
        </span>
      )}
    </div>
  );
}
