import { AnimatePresence, motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import RequestCard from './RequestCard.jsx';
import { useSimulation } from '../simulation/SimulationContext.jsx';
import { MAX_QUEUE } from '../simulation/pipeline.js';

const VISIBLE = 8;

export default function RequestQueue() {
  const { state } = useSimulation();
  const visible = state.queue.slice(0, VISIBLE);
  const hidden = state.queue.length - visible.length;

  return (
    <section aria-labelledby="queue-heading" className="panel flex flex-col p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="queue-heading" className="panel-title">Waiting requests</h2>
        <span className="rounded-full bg-cab/10 px-2.5 py-0.5 text-xs font-semibold text-cab tabular">
          {state.queue.length}/{MAX_QUEUE}
        </span>
      </div>
      <p className="mb-3 text-xs text-slate-400">
        First in, first out. On every clock cycle the request at the top enters S1.
      </p>

      {state.queue.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center">
          <Inbox size={22} className="text-slate-500" aria-hidden="true" />
          <p className="mt-2 text-sm text-slate-300">No requests waiting</p>
          <p className="mt-1 text-xs text-slate-500">
            {state.pipeline.some(Boolean)
              ? 'Everything already entered the pipeline.'
              : 'Create a booking or press Demo mode.'}
          </p>
        </div>
      ) : (
        <ol className="space-y-2" aria-label="Waiting queue, oldest first">
          <AnimatePresence initial={false}>
            {visible.map((id, i) => (
              <motion.li
                key={id}
                layout="position"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25 }}
              >
                <RequestCard request={state.requests[id]} position={i + 1} />
              </motion.li>
            ))}
          </AnimatePresence>
          {hidden > 0 && (
            <li className="pt-1 text-center text-xs text-slate-400 tabular">+ {hidden} more in line</li>
          )}
        </ol>
      )}
    </section>
  );
}
