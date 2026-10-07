import { CarTaxiFront } from 'lucide-react';
import { shortPlace } from '../data/bookings.js';

/** A waiting booking request as shown in the queue. */
export default function RequestCard({ request, position }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-ink/60 px-3 py-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cab/10 text-cab" aria-hidden="true">
        <CarTaxiFront size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold tabular">{request.id}</span>
          <span className="rounded-md bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
            {request.cabType}
          </span>
        </div>
        <p className="truncate text-xs text-slate-400" title={`${request.pickup} → ${request.destination}`}>
          {request.passenger} · {shortPlace(request.pickup)} → {shortPlace(request.destination)}
        </p>
      </div>
      <span className="shrink-0 text-right text-[11px] leading-tight text-amber-300/90">
        Waiting
        {position != null && <span className="block tabular text-slate-500">#{position}</span>}
      </span>
    </div>
  );
}
