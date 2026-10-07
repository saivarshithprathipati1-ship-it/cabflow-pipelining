import { STAGE_COUNT } from './pipeline.js';

/**
 * All COA metrics are derived from simulation state — nothing is stored twice.
 *
 *   Elapsed cycles  = cycles whose work has fully finished (= history.length)
 *   Latency         = finishCycle − enterCycle + 1   (S1 entry → S5 completion)
 *   Response time   = finishCycle − createdCycle      (includes waiting in the queue)
 *   Throughput      = completed requests ÷ elapsed cycles
 *   Utilization     = busy stages ÷ 5 (current cycle); average uses all elapsed cycles
 *   Sequential time = completed × 5   (each request runs all 5 stages alone)
 */
export function computeMetrics(state) {
  const totalRequests = state.nextId - 1;
  const completedCount = state.completed.length;
  const activeCount = state.pipeline.filter(Boolean).length;
  const waitingCount = state.queue.length;
  const elapsedCycles = state.history.length;

  let latencySum = 0;
  let responseSum = 0;
  let waitSum = 0;
  let fareSum = 0;
  for (const id of state.completed) {
    const r = state.requests[id];
    latencySum += r.finishCycle - r.enterCycle + 1;
    responseSum += r.finishCycle - r.createdCycle;
    waitSum += Math.max(0, r.enterCycle - r.createdCycle - 1);
    fareSum += r.fare;
  }

  const busyStageCycles = state.history.reduce((sum, h) => sum + h.active, 0);

  const sequentialCycles = completedCount * STAGE_COUNT;
  const pipelinedCycles = elapsedCycles;

  return {
    totalRequests,
    completedCount,
    activeCount,
    waitingCount,
    cycle: state.cycle,
    elapsedCycles,
    utilization: activeCount / STAGE_COUNT,
    avgUtilization: elapsedCycles ? busyStageCycles / (elapsedCycles * STAGE_COUNT) : 0,
    avgLatency: completedCount ? latencySum / completedCount : 0,
    avgResponse: completedCount ? responseSum / completedCount : 0,
    avgWait: completedCount ? waitSum / completedCount : 0,
    throughput: elapsedCycles ? completedCount / elapsedCycles : 0,
    revenue: fareSum,
    sequentialCycles,
    pipelinedCycles,
    observedSpeedup: completedCount && pipelinedCycles ? sequentialCycles / pipelinedCycles : 0,
  };
}

/** Ideal cycle counts for n requests on a k-stage pipeline with no stalls. */
export function theoreticalCycles(n, k = STAGE_COUNT) {
  if (n <= 0) return { sequential: 0, pipelined: 0, speedup: 0 };
  const sequential = n * k;
  const pipelined = k + (n - 1);
  return { sequential, pipelined, speedup: sequential / pipelined };
}

/** Per-request latency rows for the analytics chart (oldest first). */
export function latencyRows(state, limit = 40) {
  return state.completed
    .slice(0, limit)
    .map((id) => state.requests[id])
    .reverse()
    .map((r) => ({
      id: r.id,
      latency: r.finishCycle - r.enterCycle + 1,
      wait: Math.max(0, r.enterCycle - r.createdCycle - 1),
    }));
}

export const fmt = {
  pct: (x) => `${Math.round(x * 100)}%`,
  num: (x, digits = 2) => (Number.isFinite(x) ? x.toFixed(digits) : '0'),
  cycle: (n) => String(n).padStart(2, '0'),
  inr: (n) => `₹${Math.round(n).toLocaleString('en-IN')}`,
};
