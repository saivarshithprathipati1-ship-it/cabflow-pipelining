import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Clock, IndianRupee } from 'lucide-react';
import { useSimulation } from '../simulation/SimulationContext.jsx';
import { fmt } from '../simulation/metrics.js';

const VISIBLE = 6;

function ConfirmedCard({ r }) {
  return (
    <div className="rounded-xl border border-ok/30 bg-ok/[0.06] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-300">
          <BadgeCheck size={15} aria-hidden="true" /> Booking confirmed
        </span>
        <span className="font-display text-sm font-bold tabular">{r.id}</span>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div className="col-span-2 flex gap-1.5">
          <dt className="text-slate-500">Passenger</dt>
          <dd className="truncate text-slate-200">
            {r.passenger} · {r.cabType}
          </dd>
        </div>
        <div className="col-span-2 flex gap-1.5">
          <dt className="sr-only">Route</dt>
          <dd className="truncate text-slate-300" title={`${r.pickup} → ${r.destination}`}>
            {r.pickup} → {r.destination}
          </dd>
        </div>
        <div className="flex items-center gap-1">
          <dt className="sr-only">Fare</dt>
          <IndianRupee size={12} className="text-cab" aria-hidden="true" />
          <dd className="font-semibold text-cab tabular">{fmt.inr(r.fare).slice(1)}</dd>
          <span className="text-slate-500">· {r.distanceKm} km</span>
        </div>
        <div className="flex items-center justify-end gap-1">
          <dt className="sr-only">Driver ETA</dt>
          <Clock size={12} className="text-slate-400" aria-hidden="true" />
          <dd className="text-slate-200">ETA {r.etaMin} min</dd>
        </div>
      </dl>
      <p className="mt-2 border-t border-ok/15 pt-1.5 text-[11px] text-slate-400 tabular">
        Entered C{r.enterCycle} · confirmed C{r.finishCycle} · latency {r.finishCycle - r.enterCycle + 1} cycles
      </p>
    </div>
  );
}

export default function CompletedBookings() {
  const { state } = useSimulation();
  const visible = state.completed.slice(0, VISIBLE);
  const hidden = state.completed.length - visible.length;

  return (
    <section aria-labelledby="completed-heading" className="panel flex flex-col p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="completed-heading" className="panel-title">Confirmed bookings</h2>
        <span className="rounded-full bg-ok/10 px-2.5 py-0.5 text-xs font-semibold text-green-300 tabular">
          {state.completed.length}
        </span>
      </div>
      {state.completed.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center">
          <BadgeCheck size={22} className="text-slate-500" aria-hidden="true" />
          <p className="mt-2 text-sm text-slate-300">No bookings confirmed yet</p>
          <p className="mt-1 text-xs text-slate-500">The first request is confirmed when it finishes S5, at the end of cycle 5.</p>
        </div>
      ) : (
        <ol className="space-y-2" aria-label="Confirmed bookings, newest first" aria-live="polite">
          <AnimatePresence initial={false}>
            {visible.map((id) => (
              <motion.li
                key={id}
                layout="position"
                initial={{ opacity: 0, scale: 0.92, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              >
                <ConfirmedCard r={state.requests[id]} />
              </motion.li>
            ))}
          </AnimatePresence>
          {hidden > 0 && <li className="pt-1 text-center text-xs text-slate-400 tabular">+ {hidden} earlier bookings</li>}
        </ol>
      )}
    </section>
  );
}
