import { useEffect, useRef, useState } from 'react';
import { Settings, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { useSimulation } from '../simulation/SimulationContext.jsx';
import { SPEEDS } from '../simulation/pipeline.js';

const LINKS = [
  { route: 'dashboard', label: 'Dashboard' },
  { route: 'simulator', label: 'Simulator' },
  { route: 'pipeline', label: 'Pipeline' },
  { route: 'analytics', label: 'Analytics' },
  { route: 'about', label: 'About' },
];

const STATUS_STYLE = {
  running: { text: 'Pipeline active', dot: 'bg-ok', ring: 'ring-ok/40 text-green-300' },
  paused: { text: 'Pipeline paused', dot: 'bg-warn', ring: 'ring-warn/40 text-amber-300' },
  completed: { text: 'Run complete', dot: 'bg-pipe', ring: 'ring-pipe/40 text-cyan-200' },
  idle: { text: 'Pipeline idle', dot: 'bg-slate-500', ring: 'ring-slate-600 text-slate-300' },
};

function StatusPill() {
  const { state } = useSimulation();
  const s = STATUS_STYLE[state.status];
  return (
    <span
      className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset sm:inline-flex ${s.ring}`}
      role="status"
      aria-live="polite"
    >
      <span className={`live-dot ${s.dot} ${state.status === 'running' ? 'is-on' : ''}`} />
      {s.text}
      <span className="tabular text-slate-400">· C{state.cycle}</span>
    </span>
  );
}

function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const { state, actions, settings, toggleSetting } = useSimulation();
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="grid h-9 w-9 place-items-center rounded-xl text-slate-300 ring-1 ring-inset ring-slate-600/60 transition-colors hover:bg-white/5 hover:text-paper"
        aria-label="Simulation settings"
        aria-expanded={open}
        aria-controls="settings-panel"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={18} /> : <Settings size={18} />}
      </button>
      {open && (
        <div
          id="settings-panel"
          role="dialog"
          aria-label="Simulation settings"
          className="panel absolute right-0 top-11 z-50 w-72 space-y-4 p-4"
        >
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Clock speed</legend>
            <div className="grid grid-cols-4 gap-1.5">
              {SPEEDS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => actions.setSpeed(s.value)}
                  aria-pressed={state.speed === s.value}
                  className={`rounded-lg py-1.5 text-sm font-semibold ring-1 ring-inset transition-colors ${
                    state.speed === s.value ? 'bg-pipe/20 text-pipe ring-pipe/50' : 'text-slate-300 ring-slate-600/60 hover:bg-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>
          <Toggle
            label="Reduce motion"
            hint="Requests jump between stages instead of gliding."
            checked={settings.reduceMotion}
            onChange={() => toggleSetting('reduceMotion')}
          />
          <Toggle
            label="Show upcoming stages"
            hint="Faint cells in the timeline show where each request will be next."
            checked={settings.showUpcoming}
            onChange={() => toggleSetting('showUpcoming')}
          />
        </div>
      )}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-slate-400">{hint}</span>
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-slate-700 transition-colors peer-checked:bg-pipe peer-focus-visible:ring-2 peer-focus-visible:ring-cab after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4"
      />
    </label>
  );
}

export default function Navbar({ route, onNavigate }) {
  const go = (e, name) => {
    e.preventDefault();
    onNavigate(name);
  };
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <a href="#/" onClick={(e) => go(e, 'home')} className="flex items-center gap-2.5" aria-label="CABFLOW home">
          <Logo />
          <span className="font-display text-lg font-bold tracking-wide">
            CAB<span className="text-cab">FLOW</span>
          </span>
        </a>
        <nav aria-label="Main" className="ml-4 hidden md:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.route}>
                <a
                  href={`#/${l.route}`}
                  onClick={(e) => go(e, l.route)}
                  aria-current={route === l.route ? 'page' : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    route === l.route ? 'bg-white/[0.07] text-paper' : 'text-slate-400 hover:text-paper'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <StatusPill />
          <SettingsMenu />
        </div>
      </div>
      {/* Compact navigation for phones and small tablets */}
      <nav aria-label="Main mobile" className="scroll-thin overflow-x-auto border-t border-white/5 md:hidden">
        <ul className="flex min-w-max gap-1 px-3 py-2">
          {LINKS.map((l) => (
            <li key={l.route}>
              <a
                href={`#/${l.route}`}
                onClick={(e) => go(e, l.route)}
                aria-current={route === l.route ? 'page' : undefined}
                className={`block rounded-lg px-3 py-1.5 text-sm font-medium ${
                  route === l.route ? 'bg-white/[0.07] text-paper' : 'text-slate-400'
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
