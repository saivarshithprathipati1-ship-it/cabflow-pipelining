/**
 * CABFLOW pipeline engine
 * ------------------------------------------------------------------
 * A pure, framework-free model of a 5-stage linear pipeline.
 * React only calls `simulationReducer`; every state change happens in
 * one atomic, synchronous step, which is what prevents race conditions
 * and duplicate requests no matter how fast the user clicks.
 *
 * State shape
 *   cycle        number of the clock cycle currently on screen (0 = not started)
 *   cycleClosed  true when the current cycle's work is finished (start / after drain)
 *   pipeline     [S1, S2, S3, S4, S5] -> request id or null
 *   queue        request ids waiting to enter S1 (FIFO)
 *   completed    request ids that finished S5 (newest first)
 *   requests     { [id]: request record }
 *   history      one snapshot per finished cycle (drives the charts)
 */

export const STAGE_COUNT = 5;

export const STAGES = [
  {
    key: 'S1',
    name: 'Request Validation',
    short: 'Validation',
    color: '#00D4FF',
    task: 'Checks passenger details, pickup, destination and cab type.',
    doneLabel: 'Request valid',
  },
  {
    key: 'S2',
    name: 'Location Processing',
    short: 'Location',
    color: '#6C8CFF',
    task: 'Resolves pickup and drop points and computes the route distance.',
    doneLabel: 'Route resolved',
  },
  {
    key: 'S3',
    name: 'Driver Search',
    short: 'Driver',
    color: '#B57BFF',
    task: 'Finds the nearest free driver with the requested cab type.',
    doneLabel: 'Driver assigned',
  },
  {
    key: 'S4',
    name: 'Fare Calculation',
    short: 'Fare',
    color: '#F59E0B',
    task: 'Applies base fare plus per-km rate for the cab type.',
    doneLabel: 'Fare ready',
  },
  {
    key: 'S5',
    name: 'Booking Confirmation',
    short: 'Confirm',
    color: '#22C55E',
    task: 'Locks the driver, sends the ETA and confirms the booking.',
    doneLabel: 'Confirmed',
  },
];

export const SPEEDS = [
  { value: 0.5, label: '0.5x', ms: 2000 },
  { value: 1, label: '1x', ms: 1000 },
  { value: 2, label: '2x', ms: 500 },
  { value: 4, label: '4x', ms: 250 },
];

export const cycleMsFor = (speed) => (SPEEDS.find((s) => s.value === speed) ?? SPEEDS[1]).ms;

/** Limits that keep the UI responsive even if someone spams the buttons. */
export const MAX_QUEUE = 60;
export const MAX_TOTAL_REQUESTS = 999;

export const formatRequestId = (n) => `REQ-${String(n).padStart(3, '0')}`;

export function createInitialState(speed = 1) {
  return {
    status: 'idle', // idle | running | paused | completed
    cycle: 0,
    cycleClosed: true,
    manualStep: false,
    speed,
    runId: 0,
    nextId: 1,
    requests: {},
    queue: [],
    pipeline: Array(STAGE_COUNT).fill(null),
    completed: [],
    history: [],
    notice: null,
    noticeSeq: 0,
  };
}

function withNotice(state, tone, text) {
  const id = state.noticeSeq + 1;
  return { ...state, noticeSeq: id, notice: { id, tone, text } };
}

const hasWork = (state) => state.queue.length > 0 || state.pipeline.some(Boolean);

/* ------------------------------------------------------------------ */
/* Adding requests                                                     */
/* ------------------------------------------------------------------ */

function addRequests(state, drafts) {
  const created = state.nextId - 1;
  const room = Math.min(MAX_QUEUE - state.queue.length, MAX_TOTAL_REQUESTS - created);
  const accepted = drafts.slice(0, Math.max(0, room));

  if (accepted.length === 0) {
    return withNotice(
      state,
      'warning',
      created >= MAX_TOTAL_REQUESTS
        ? `Reached the ${MAX_TOTAL_REQUESTS}-request limit. Reset to start a new run.`
        : `The waiting queue is full (${MAX_QUEUE}). Start the pipeline to free space.`,
    );
  }

  const requests = { ...state.requests };
  const queue = [...state.queue];
  let nextId = state.nextId;

  for (const draft of accepted) {
    const id = formatRequestId(nextId);
    nextId += 1;
    requests[id] = {
      ...draft,
      id,
      seq: nextId - 1,
      status: 'waiting',
      stage: null,
      createdCycle: state.cycle, // clock value when the passenger pressed "Book"
      enterCycle: null, // cycle in which it occupied S1
      finishCycle: null, // cycle in which it occupied S5
    };
    queue.push(id);
  }

  let next = { ...state, requests, queue, nextId };

  // A finished run that receives new work becomes "paused" so Start resumes it.
  if (state.status === 'completed') next.status = 'paused';

  if (accepted.length < drafts.length) {
    next = withNotice(next, 'warning', `Added ${accepted.length} of ${drafts.length}; the queue is at its limit.`);
  } else if (state.notice?.tone === 'info' || state.notice?.tone === 'warning') {
    next = { ...next, notice: null };
  }
  return next;
}

/* ------------------------------------------------------------------ */
/* THE CORE PIPELINE ALGORITHM — one clock edge                        */
/* ------------------------------------------------------------------ */

/**
 * Advances the pipeline by one clock cycle.
 *
 * On every clock edge, in this order:
 *   1. The request in S5 finishes and moves to `completed`.
 *   2. S4 -> S5
 *   3. S3 -> S4
 *   4. S2 -> S3
 *   5. S1 -> S2
 *   6. The oldest waiting request enters S1.
 *
 * Steps 2–6 are a single right-shift of the pipeline array, so every
 * request moves exactly one stage per cycle and no two requests can ever
 * share a stage. If the shift leaves the pipeline empty (nothing waiting,
 * nothing in flight) the run is complete and no new cycle is started,
 * so N requests take exactly N + (5 − 1) cycles.
 */
export function advanceCycle(state) {
  const { pipeline, queue } = state;
  const requests = { ...state.requests };
  let completed = state.completed;
  let history = state.history;

  // Step 1: close the cycle that is on screen — retire S5 and record metrics.
  if (!state.cycleClosed) {
    const retiringId = pipeline[STAGE_COUNT - 1];
    if (retiringId) {
      requests[retiringId] = { ...requests[retiringId], status: 'completed', stage: null };
      completed = [retiringId, ...completed];
    }
    const active = pipeline.filter(Boolean).length;
    history = [
      ...history,
      {
        cycle: state.cycle,
        active,
        utilization: Math.round((active / STAGE_COUNT) * 100),
        completedInCycle: retiringId ? 1 : 0,
        completedTotal: completed.length,
        throughput: completed.length / state.cycle,
        waiting: queue.length,
      },
    ];
  }

  // Steps 2–6: shift every stage one position to the right and load S1.
  const incomingId = queue[0] ?? null;
  const shifted = [incomingId, ...pipeline.slice(0, STAGE_COUNT - 1)];

  if (shifted.every((id) => id === null)) {
    // Nothing left in flight and nothing waiting: the run is drained.
    const finished = { ...state, requests, completed, history, pipeline: shifted, cycleClosed: true };
    if (completed.length === 0) return { ...finished, status: 'idle' };
    return withNotice(
      { ...finished, status: 'completed' },
      'success',
      `All ${completed.length} bookings confirmed in ${state.cycle} cycles. A sequential system would need ${completed.length * STAGE_COUNT}.`,
    );
  }

  const cycle = state.cycle + 1;
  shifted.forEach((id, stageIndex) => {
    if (!id) return;
    const r = requests[id];
    requests[id] = {
      ...r,
      stage: stageIndex,
      status: 'processing',
      enterCycle: stageIndex === 0 ? cycle : r.enterCycle,
      finishCycle: stageIndex === STAGE_COUNT - 1 ? cycle : r.finishCycle,
    };
  });

  return {
    ...state,
    cycle,
    cycleClosed: false,
    requests,
    completed,
    history,
    pipeline: shifted,
    queue: incomingId ? queue.slice(1) : queue,
  };
}

/* ------------------------------------------------------------------ */
/* Reducer                                                             */
/* ------------------------------------------------------------------ */

export function simulationReducer(state, action) {
  switch (action.type) {
    case 'ADD_REQUESTS':
      return addRequests(state, action.drafts);

    case 'START': {
      if (state.status === 'running') return state;
      if (!hasWork(state)) {
        return withNotice(state, 'info', 'The pipeline is empty. Create at least one booking request, then press Start.');
      }
      // If the pipeline is empty, load S1 right away so Start responds instantly.
      const base = state.cycleClosed ? advanceCycle(state) : state;
      return { ...base, status: 'running', manualStep: false, notice: null };
    }

    case 'PAUSE':
      if (state.status !== 'running') return state;
      return { ...state, status: 'paused' };

    case 'TICK':
      // Ignore ticks that arrive after a pause/reset (defensive; the clock also cleans up).
      if (state.status !== 'running' || action.runId !== state.runId) return state;
      return advanceCycle(state);

    case 'STEP': {
      if (state.status === 'running') return state;
      if (!hasWork(state)) {
        return withNotice(state, 'info', 'Nothing to step through. Create a booking request first.');
      }
      const next = advanceCycle(state);
      return next.status === 'completed'
        ? next
        : { ...next, status: 'paused', manualStep: true, notice: null };
    }

    case 'RESET':
      return { ...createInitialState(state.speed), runId: state.runId + 1 };

    case 'SET_SPEED':
      return { ...state, speed: action.speed };

    case 'DEMO': {
      // Fresh run, 10 requests, and the first clock edge immediately.
      let next = { ...createInitialState(state.speed), runId: state.runId + 1 };
      next = addRequests(next, action.drafts);
      next = advanceCycle(next);
      return withNotice(
        { ...next, status: 'running' },
        'info',
        `Demo mode: ${action.drafts.length} requests queued. Watch them occupy different stages at the same time.`,
      );
    }

    case 'DISMISS_NOTICE':
      return state.notice ? { ...state, notice: null } : state;

    default:
      return state;
  }
}

/** Stage index (0–4) that request `r` occupies in cycle `c`, or -1. Valid because the pipeline never stalls. */
export function stageAtCycle(r, c) {
  if (r.enterCycle == null) return -1;
  const k = c - r.enterCycle;
  return k >= 0 && k < STAGE_COUNT ? k : -1;
}
