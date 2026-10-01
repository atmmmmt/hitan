'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type Option = { value: string; label: string };

/** قائمة منسدلة مخصّصة بدل select الأصلي (يُرسل القيمة عبر input مخفي). */
export function Select({
  name,
  options,
  defaultValue,
  className = '',
  onChange,
}: {
  name: string;
  options: Option[];
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue ?? options[0]?.value ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const choose = (v: string) => {
    setValue(v);
    setOpen(false);
    onChange?.(v);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(options[active].value);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`input flex items-center justify-between gap-3 text-start font-sans font-normal ${open ? 'border-brand-600 ring-4 ring-brand-100' : ''}`}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-stone-400 transition-transform ${open ? 'rotate-180 text-brand-600' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-auto rounded-2xl border border-stone-200 bg-white p-1.5 shadow-soft animate-fade-up [animation-duration:180ms]"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o.value)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-[0.95rem] ${
                  i === active ? 'bg-stone-100' : ''
                } ${isSelected ? 'font-medium text-brand-700' : 'text-stone-800'}`}
              >
                {o.label}
                {isSelected && <Check size={16} className="text-brand-600" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
