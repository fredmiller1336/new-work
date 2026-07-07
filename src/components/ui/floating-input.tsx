import React, { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, required = false, error, className, value, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(Boolean(value));

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(Boolean(e.target.value));
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      props.onChange?.(e);
    };

    React.useEffect(() => {
      setHasValue(Boolean(value));
    }, [value]);

    const isLabelFloating = isFocused || hasValue;

    return (
      <div className={cn("relative w-full", className)}>
        <div className="relative">
          <input
            ref={ref}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={cn(
              // Base styles
              "w-full px-4 py-2 pt-4 pb-1.5",
              "bg-white border rounded-2xl",
              "text-xs text-black",
              "placeholder-transparent",
              "transition-all duration-200 ease-out",
              "focus:outline-none",
              "selection:bg-muted-foreground/20 selection:text-muted-foreground/80",
              
              // Border and shadow states
              "border-border shadow-sm",
              "hover:border-muted-foreground/40",
              "focus:border-primary focus:ring-1 focus:ring-primary/20",
              
              // Error state
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              
              // Font
              "font-chevin"
            )}
            {...props}
          />
          
          {/* Floating Label */}
          <label
            className={cn(
              "absolute left-4 transition-all duration-200 ease-out",
              "pointer-events-none select-none",
              "font-chevin font-medium",
              
              // Position states
              isLabelFloating
                ? "top-1.5 text-[9px] text-gray-500"
                : "top-2.5 text-xs text-gray-500",
                
              // Error state
              error && "text-destructive"
            )}
          >
            {label}
            {required && <span className="text-gray-400 ml-1">*</span>}
          </label>
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-xs text-destructive font-chevin">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export { FloatingInput };