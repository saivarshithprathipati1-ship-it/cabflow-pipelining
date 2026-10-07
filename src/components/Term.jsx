import { useId } from 'react';
import { GLOSSARY } from '../data/glossary.js';

/**
 * Inline COA term with an accessible tooltip.
 * Works on hover and on keyboard focus; the definition is linked with aria-describedby.
 */
export default function Term({ name, children, align = 'center' }) {
  const id = useId();
  const tip = GLOSSARY[name];
  if (!tip) return children;
  const position =
    align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  return (
    <span className="group relative inline-flex">
      <span
        tabIndex={0}
        aria-describedby={id}
        className="cursor-help underline decoration-slate-500 decoration-dotted underline-offset-4 outline-none hover:decoration-pipe focus-visible:decoration-pipe focus-visible:outline-2 focus-visible:outline-cab"
      >
        {children}
      </span>
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none absolute bottom-full z-50 mb-2 w-60 rounded-lg border border-slate-600/50 bg-[#0d1426] px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-slate-200 opacity-0 shadow-xl transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 ${position}`}
      >
        {tip}
      </span>
    </span>
  );
}
