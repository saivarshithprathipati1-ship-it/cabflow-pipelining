import { motion } from 'framer-motion';
import { ArrowDown, Cpu, Play, Route, Workflow } from 'lucide-react';
import HeroLane from '../components/HeroLane.jsx';
import { STAGES } from '../simulation/pipeline.js';
import { STAGE_ICONS } from '../components/PipelineStage.jsx';
import { useNavigate } from '../hooks/useHashRoute.js';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="inline-flex items-center gap-2 rounded-full border border-pipe/30 bg-pipe/10 px-3 py-1 text-xs font-medium text-cyan-200">
            <Cpu size={14} aria-hidden="true" /> Computer Organization &amp; Architecture case study
          </p>
          <h1 className="mt-5 font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            CAB<span className="text-cab">FLOW</span>
          </h1>
          <p className="mt-4 font-display text-xl font-semibold text-slate-200 sm:text-2xl">
            Pipelined Online Cab Booking Simulator
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Visualizing how computer pipelining reduces processing delays in high-demand cab booking.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn-cab px-6 py-3 text-base" onClick={() => navigate('dashboard')}>
              <Play size={18} aria-hidden="true" /> Start simulation
            </button>
            <button type="button" className="btn-ghost px-6 py-3 text-base" onClick={() => navigate('pipeline')}>
              <Workflow size={18} aria-hidden="true" /> Explore pipeline
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="panel p-5 sm:p-7"
        >
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Five bookings, five stages, one clock</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-green-300">
              <span className="live-dot is-on bg-ok" /> live
            </span>
          </div>
          <HeroLane />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Every clock tick, each cab moves one gate forward and a new booking enters at S1. No gate ever sits idle
            while there are passengers waiting.
          </p>
        </motion.div>
      </section>

      {/* Problem → solution */}
      <section className="border-y border-white/5 bg-panel/40">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2">
          <article className="rounded-2xl border border-bad/25 bg-bad/[0.04] p-6">
            <h2 className="font-display text-2xl font-semibold text-red-200">The real-world problem</h2>
            <p className="mt-3 leading-relaxed text-slate-300">
              Online cab platforms may receive many booking requests simultaneously. Processing every request through
              all booking operations sequentially can increase response delays.
            </p>
            <p className="mt-4 text-sm text-slate-400">
              Ten passengers, five operations each, one at a time: the tenth passenger waits 50 cycles.
            </p>
          </article>
          <article className="rounded-2xl border border-ok/25 bg-ok/[0.04] p-6">
            <h2 className="font-display text-2xl font-semibold text-green-200">The COA solution</h2>
            <p className="mt-3 leading-relaxed text-slate-300">
              Divide the booking workflow into pipeline stages so multiple requests can be processed simultaneously at
              different stages.
            </p>
            <p className="mt-4 text-sm text-slate-400">
              Same ten passengers in a five-stage pipeline: everyone is confirmed after 14 cycles.
            </p>
          </article>
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">The booking workflow, as a pipeline</h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          A request flows through five stages. Each stage is independent, so while S3 searches for a driver for one
          passenger, S1 can already be validating the next one.
        </p>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <li className="panel flex flex-col p-4">
            <Route size={20} className="text-cab" aria-hidden="true" />
            <span className="mt-3 font-display font-semibold">Request</span>
            <span className="mt-1 text-sm text-slate-400">Passenger taps “Book”. The request joins the queue.</span>
          </li>
          {STAGES.map((s, i) => {
            const Icon = STAGE_ICONS[i];
            return (
              <li key={s.key} className="panel relative flex flex-col p-4">
                <ArrowDown size={14} className="absolute -top-3 left-6 text-slate-600 sm:hidden" aria-hidden="true" />
                <Icon size={20} style={{ color: s.color }} aria-hidden="true" />
                <span className="mt-3 font-display font-semibold">
                  <span style={{ color: s.color }}>{s.key}</span> {s.name}
                </span>
                <span className="mt-1 text-sm text-slate-400">{s.task}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" className="btn-cab" onClick={() => navigate('simulator')}>
            <Play size={16} aria-hidden="true" /> Open the simulator
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate('about')}>
            Read the COA explanation
          </button>
        </div>
      </section>
    </div>
  );
}
