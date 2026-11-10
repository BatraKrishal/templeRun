import React, { useRef, useEffect } from 'react';
import { Mic, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

interface FormFieldProps {
  id: string;
  label: string;
  labelHindi?: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  value: any;
  onChange: (val: any) => void;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  voiceFilled?: boolean;
  error?: string;
  helpText?: string;
}

export const FormFieldWithVoice: React.FC<FormFieldProps> = ({
  id,
  label,
  labelHindi,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  options,
  voiceFilled = false,
  error,
  helpText,
}) => {
  const { language, narrateElement } = useAccessibility();
  const inputRef = useRef<any>(null);

  const displayLabel = language === 'hi' && labelHindi ? labelHindi : label;

  // Scroll into view when voice fills or targets this field
  useEffect(() => {
    if (voiceFilled && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputRef.current.focus();
    }
  }, [voiceFilled]);

  return (
    <div
      className={`space-y-1.5 p-3 rounded-xl transition-all ${
        voiceFilled
          ? 'bg-amber-50/70 border-2 border-amber-400 ring-2 ring-amber-200'
          : 'bg-white border border-gray-200 hover:border-gray-300'
      }`}
      onMouseEnter={() =>
        narrateElement(`${displayLabel}. ${helpText || ''} ${required ? 'यह विवरण अनिवार्य है।' : ''}`)
      }
    >
      <div className="flex items-center justify-between text-xs font-semibold text-ink-700">
        <label htmlFor={id} className="flex items-center gap-1.5 cursor-pointer">
          <span>{displayLabel}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>

        {voiceFilled && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 animate-fade-in">
            <Mic className="size-3" />
            <span>[VOICE_AI]</span>
          </span>
        )}
      </div>

      <div className="relative">
        {type === 'select' ? (
          <select
            id={id}
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navbar focus:border-navbar text-ink-900"
          >
            <option value="">{placeholder || '-- कृपया चयन करें (Select) --'}</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={id}
            ref={inputRef}
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navbar focus:border-navbar text-ink-900"
          />
        ) : (
          <input
            id={id}
            ref={inputRef}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navbar focus:border-navbar text-ink-900"
          />
        )}

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            title="Clear Field"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
      </div>

      {helpText && <p className="text-[11px] text-gray-500">{helpText}</p>}
      {error && <p className="text-[11px] text-red-600 font-semibold">{error}</p>}
    </div>
  );
};

