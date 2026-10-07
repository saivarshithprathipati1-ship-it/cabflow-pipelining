/**
 * Engine tests — run with:  npm run test:engine
 * Pure Node, no browser needed. Covers the brief's Tests 1, 2, 3, 4, 5 and 7
 * at the logic level (timers and visuals are covered by manual testing).
 */
import assert from 'node:assert/strict';
import { simulationReducer as reduce, createInitialState, STAGE_COUNT } from '../src/simulation/pipeline.js';
import { computeMetrics, theoreticalCycles } from '../src/simulation/metrics.js';
import { randomBookingDrafts, validateBooking } from '../src/data/bookings.js';

const tick = (s) => reduce(s, { type: 'TICK', runId: s.runId });
const add = (s, n) => reduce(s, { type: 'ADD_REQUESTS', drafts: randomBookingDrafts(n) });
const row = (s) => s.pipeline.map((id) => id ?? '----').join(' | ');
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`  ✓ ${name}`); };

console.log('CABFLOW engine tests');

test('Test 1: one request flows S1 → S5 → completed', () => {
  let s = add(createInitialState(), 1);
  s = reduce(s, { type: 'START' });
  for (let stage = 0; stage < STAGE_COUNT; stage++) {
    assert.equal(s.cycle, stage + 1);
    assert.equal(s.pipeline[stage], 'REQ-001');
    assert.equal(s.pipeline.filter(Boolean).length, 1);
    s = tick(s);
  }
  assert.equal(s.status, 'completed');
  assert.deepEqual(s.completed, ['REQ-001']);
  assert.equal(s.cycle, 5);
  const m = computeMetrics(s);
  assert.equal(m.avgLatency, 5);
  assert.equal(m.throughput, 1 / 5);
});

test('Test 2: five requests occupy five different stages in cycle 5', () => {
  let s = add(createInitialState(), 5);
  s = reduce(s, { type: 'START' });
  const trace = [row(s)];
  while (s.cycle < 5) { s = tick(s); trace.push(row(s)); }
  console.log(trace.map((t, i) => `      C${i + 1}: ${t}`).join('\n'));
  assert.deepEqual(s.pipeline, ['REQ-005', 'REQ-004', 'REQ-003', 'REQ-002', 'REQ-001']);
  assert.equal(computeMetrics(s).utilization, 1);
});

test('Test 3/4: pause ignores ticks, resume continues', () => {
  let s = add(createInitialState(), 3);
  s = reduce(s, { type: 'START' });
  s = tick(s);
  s = reduce(s, { type: 'PAUSE' });
  const frozen = s;
  s = tick(s); s = tick(s);
  assert.equal(s, frozen, 'paused state must not change on tick');
  s = reduce(s, { type: 'START' });
  assert.equal(s.cycle, frozen.cycle, 'resume must not skip a cycle');
  s = tick(s);
  assert.equal(s.cycle, frozen.cycle + 1);
});

test('Test 5: reset returns to the initial state (speed kept)', () => {
  let s = reduce(createInitialState(), { type: 'SET_SPEED', speed: 2 });
  s = add(s, 4); s = reduce(s, { type: 'START' }); s = tick(s); s = tick(s);
  const r = reduce(s, { type: 'RESET' });
  const fresh = createInitialState(2);
  for (const k of ['status', 'cycle', 'queue', 'pipeline', 'completed', 'history', 'nextId', 'requests']) {
    assert.deepEqual(r[k], fresh[k], k);
  }
  assert.equal(r.speed, 2);
  assert.notEqual(r.runId, s.runId, 'stale timer ticks are rejected after reset');
  assert.equal(tick({ ...r, status: 'running', runId: r.runId }).cycle, r.cycle);
});

test('Test 7: demo mode — 10 requests in 10 + 4 = 14 cycles, no duplicates', () => {
  let s = reduce(createInitialState(), { type: 'DEMO', drafts: randomBookingDrafts(10) });
  assert.equal(s.status, 'running');
  assert.equal(s.cycle, 1);
  let guard = 0;
  while (s.status === 'running' && guard++ < 100) {
    const ids = s.pipeline.filter(Boolean);
    assert.equal(new Set(ids).size, ids.length, 'a request appeared in two stages');
    s = tick(s);
  }
  assert.equal(s.status, 'completed');
  assert.equal(s.completed.length, 10);
  assert.equal(s.cycle, theoreticalCycles(10).pipelined);
  const m = computeMetrics(s);
  assert.equal(m.elapsedCycles, 14);
  assert.equal(m.sequentialCycles, 50);
  assert.ok(Math.abs(m.throughput - 10 / 14) < 1e-9);
  assert.equal(m.avgLatency, 5);
  assert.equal(s.history.length, 14);
  assert.equal(s.history.at(-1).completedTotal, 10);
});

test('Requests added mid-run join the queue and finish in order', () => {
  let s = add(createInitialState(), 2);
  s = reduce(s, { type: 'START' }); s = tick(s); s = tick(s);
  s = add(s, 2);
  while (s.status === 'running') s = tick(s);
  assert.deepEqual([...s.completed].reverse(), ['REQ-001', 'REQ-002', 'REQ-003', 'REQ-004']);
  // Late requests: same 5-cycle latency
  assert.equal(computeMetrics(s).avgLatency, 5);
});

test('Step mode advances exactly one cycle and leaves the clock paused', () => {
  let s = add(createInitialState(), 2);
  s = reduce(s, { type: 'STEP' });
  assert.equal(s.cycle, 1); assert.equal(s.status, 'paused');
  s = reduce(s, { type: 'STEP' });
  assert.deepEqual(s.pipeline.slice(0, 2), ['REQ-002', 'REQ-001']);
});

test('Start with nothing queued shows a message instead of running', () => {
  const s = reduce(createInitialState(), { type: 'START' });
  assert.equal(s.status, 'idle');
  assert.equal(s.notice.tone, 'info');
});

test('Resuming a finished run with new requests continues the clock', () => {
  let s = add(createInitialState(), 1);
  s = reduce(s, { type: 'START' });
  while (s.status === 'running') s = tick(s);
  s = add(s, 1);
  assert.equal(s.status, 'paused');
  s = reduce(s, { type: 'START' });
  assert.equal(s.cycle, 6);
  assert.equal(s.pipeline[0], 'REQ-002');
  while (s.status === 'running') s = tick(s);
  assert.equal(s.history.length, s.cycle, 'one snapshot per cycle, no duplicates');
});

test('Queue limit and validation', () => {
  let s = add(createInitialState(), 80);
  assert.equal(s.queue.length, 60);
  assert.equal(s.notice.tone, 'warning');
  assert.ok(validateBooking({ passenger: '', pickup: 'X', destination: 'X', cabType: 'Bus' }).passenger);
  assert.deepEqual(validateBooking({ passenger: 'Sai', pickup: 'SRM University', destination: 'Chennai Central', cabType: 'Sedan' }), {});
  assert.ok(validateBooking({ passenger: 'Sai', pickup: 'Guindy', destination: 'Guindy', cabType: 'Mini' }).destination);
});

console.log(`\n${passed} tests passed.`);
