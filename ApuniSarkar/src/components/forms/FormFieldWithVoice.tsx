import React, { useRef, useEffect } from 'react';
import { Mic, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useVoice } from '../../context/VoiceContext';

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
  const { startFieldDictation, activeFocusedField, isListening } = useVoice();
  const inputRef = useRef<any>(null);

  const isFieldBeingDictated = activeFocusedField === id;
  const displayLabel = language === 'hi' && labelHindi ? labelHindi : label;

  // Scroll into view when voice fills or targets this field
  useEffect(() => {
    if ((voiceFilled || isFieldBeingDictated) && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputRef.current.focus();
    }
  }, [voiceFilled, isFieldBeingDictated]);

  return (
    <div
      className={`space-y-1.5 p-3 rounded-xl transition-all ${
        isFieldBeingDictated
          ? 'bg-red-50/60 border-2 border-red-400 ring-4 ring-red-200'
          : voiceFilled
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

        <div className="flex items-center gap-1.5">
          {voiceFilled && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 animate-fade-in">
              <Mic className="size-3" />
              <span>[VOICE_AI]</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => startFieldDictation(id, displayLabel)}
            className={`transition-all flex items-center gap-1 text-[11px] rounded-full cursor-pointer ${
              isFieldBeingDictated && isListening
                ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-300 px-2 py-0.5 shadow-sm'
                : 'text-gray-400 hover:text-amber-700 hover:bg-amber-100 p-1'
            }`}
            title={`बोलकर भरें: ${displayLabel} (Click to speak this field)`}
          >
            <Mic className="size-3.5" />
            {isFieldBeingDictated && isListening && (
              <span className="text-[10px] font-bold">बोलिए...</span>
            )}
          </button>
        </div>
      </div>

      <div className="relative">
        {type === 'select' ? (
          <select
            id={id}
            name={id}
            aria-label={displayLabel}
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
            name={id}
            aria-label={displayLabel}
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
            name={id}
            aria-label={displayLabel}
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

