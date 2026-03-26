'use client';

import React, { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

/**
 * 6-digit OTP input with individual digit boxes.
 * Features: auto-advance, auto-backspace, paste support, error state.
 */
export default function OTPInput({ value, onChange, error = false, disabled = false }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const inputVal = e.target.value;

    // Only accept single digit
    if (!/^\d?$/.test(inputVal)) return;

    const newDigits = [...digits];
    newDigits[index] = inputVal;
    const newValue = newDigits.join('').replace(/\s/g, '');
    onChange(newValue);

    // Auto-advance to next input
    if (inputVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    // Auto-backspace: if current box is empty and backspace is pressed, move to previous
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      onChange(newDigits.join('').replace(/\s/g, ''));
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow key navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      onChange(pasted);
      // Focus the next empty box or the last box
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`
            w-12 h-14 text-center text-xl font-semibold rounded-lg border-2
            outline-none transition-all duration-200
            ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}
            ${error
              ? 'border-red-500 text-red-600 focus:ring-2 focus:ring-red-200'
              : 'border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
            }
          `}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
