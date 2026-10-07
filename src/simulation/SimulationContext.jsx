import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createInitialState, cycleMsFor, simulationReducer } from './pipeline.js';
import { computeMetrics } from './metrics.js';
import { randomBookingDrafts } from '../data/bookings.js';

const SimulationContext = createContext(null);

/**
 * The simulation clock.
 * Exactly one setTimeout exists at any moment, and only while running.
 * It is re-armed after every tick (the cycle number changes), and torn
 * down on pause, reset, speed change and unmount. When paused mid-cycle
 * we remember the remaining time so resuming finishes the same cycle
 * instead of restarting it — this keeps the progress bars in sync.
 */
function useSimulationClock(state, dispatch, cycleMs) {
  const remainingRef = useRef(null); // { key, ms }
  const { status, cycle, runId } = state;

  useEffect(() => {
    if (status !== 'running') return undefined;

    const key = `${runId}:${cycle}:${cycleMs}`;
    const delay = remainingRef.current?.key === key ? remainingRef.current.ms : cycleMs;
    remainingRef.current = null;

    const startedAt = performance.now();
    let fired = false;
    const timer = window.setTimeout(() => {
      fired = true;
      dispatch({ type: 'TICK', runId });
    }, delay);

    return () => {
      window.clearTimeout(timer);
      if (!fired) {
        remainingRef.current = { key, ms: Math.max(0, delay - (performance.now() - startedAt)) };
      }
    };
  }, [status, cycle, runId, cycleMs, dispatch]);
}

export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(simulationReducer, undefined, () => createInitialState(1));
  const [settings, setSettings] = useState({ reduceMotion: false, showUpcoming: true });

  const cycleMs = cycleMsFor(state.speed);
  useSimulationClock(state, dispatch, cycleMs);

  const actions = useMemo(
    () => ({
      start: () => dispatch({ type: 'START' }),
      pause: () => dispatch({ type: 'PAUSE' }),
      step: () => dispatch({ type: 'STEP' }),
      reset: () => dispatch({ type: 'RESET' }),
      setSpeed: (speed) => dispatch({ type: 'SET_SPEED', speed }),
      addRequest: (draft) => dispatch({ type: 'ADD_REQUESTS', drafts: [draft] }),
      addRandom: (count) => dispatch({ type: 'ADD_REQUESTS', drafts: randomBookingDrafts(count) }),
      runDemo: () => dispatch({ type: 'DEMO', drafts: randomBookingDrafts(10) }),
      dismissNotice: () => dispatch({ type: 'DISMISS_NOTICE' }),
    }),
    [],
  );

  const toggleSetting = useCallback(
    (name) => setSettings((s) => ({ ...s, [name]: !s[name] })),
    [],
  );

  const metrics = useMemo(() => computeMetrics(state), [state]);

  // Movement between stages must finish well inside one cycle, even at 4x.
  const moveDuration = Math.min(0.55, (cycleMs / 1000) * 0.55);

  const value = useMemo(
    () => ({ state, metrics, actions, cycleMs, moveDuration, settings, toggleSetting }),
    [state, metrics, actions, cycleMs, moveDuration, settings, toggleSetting],
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used inside <SimulationProvider>');
  return ctx;
}
