# CABFLOW — Pipelined Online Cab Booking Simulator

A Computer Organization & Architecture case study. Online cab booking is modelled as a
5-stage pipeline so you can watch several booking requests occupy different stages in the
same clock cycle.

## Run it

```bash
npm install
npm run dev          # opens http://localhost:5173
npm run test:engine  # pipeline engine tests in plain Node (no browser needed)
npm run build        # production build in dist/
```

No backend, API keys, maps or environment variables are needed. (Fonts load from Google
Fonts when online and fall back to system fonts offline.)

## Classroom demo in 10 seconds

1. Open **Simulator** (or Dashboard).
2. Press **Demo mode** — the engine resets, queues REQ-001…REQ-010 and starts the clock.
3. At cycle 5 the pipeline shows `S1=REQ-005 S2=REQ-004 S3=REQ-003 S4=REQ-002 S5=REQ-001`.
4. The run ends after **14 cycles** (5 + 10 − 1) instead of 50 sequential cycles.
5. Use **Pause** + **Step** to walk through the cycles one at a time while explaining.

## Folder structure

```
cabflow/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/favicon.svg
├── scripts/test-engine.mjs        # Node tests for the engine (brief tests 1–5, 7)
└── src/
    ├── main.jsx
    ├── App.jsx                    # shell, hash routing, MotionConfig
    ├── index.css                  # Tailwind layers, progress bar, keyframes
    ├── simulation/
    │   ├── pipeline.js            # PURE engine: stages, reducer, advanceCycle()
    │   ├── metrics.js             # latency, throughput, utilization, speedup
    │   └── SimulationContext.jsx  # useReducer + the single clock timer
    ├── data/
    │   ├── bookings.js            # mock Chennai locations, fares, validation
    │   └── glossary.js            # tooltip definitions for COA terms
    ├── hooks/useHashRoute.js      # tiny router (#/dashboard, #/simulator …)
    ├── components/
    │   ├── Navbar.jsx             # links, live status pill, settings menu
    │   ├── BookingForm.jsx
    │   ├── RequestCard.jsx
    │   ├── RequestQueue.jsx
    │   ├── Pipeline.jsx           # 5 stages + shared-layout animation group
    │   ├── PipelineStage.jsx      # stage card + moving request token
    │   ├── PipelineTimeline.jsx   # space-time diagram (rows = requests, cols = cycles)
    │   ├── LiveStatus.jsx
    │   ├── MetricsCards.jsx
    │   ├── SimulationControls.jsx # start/pause/step/reset, speed, demo, notices
    │   ├── CompletedBookings.jsx
    │   ├── ComparisonCard.jsx     # sequential vs pipelined cycles + speedup
    │   ├── HeroLane.jsx           # landing animation
    │   ├── AnimatedNumber.jsx, Term.jsx, Logo.jsx, PageHeader.jsx
    └── pages/
        ├── Landing.jsx
        ├── Dashboard.jsx
        ├── Simulator.jsx
        ├── PipelinePage.jsx
        ├── Analytics.jsx
        └── About.jsx
```

## How the engine works

`simulation/pipeline.js` holds `pipeline = [S1, S2, S3, S4, S5]`. On every clock edge
`advanceCycle()` does, in one atomic reducer step:

1. retire the request in S5 to `completed`
2. shift S4→S5, S3→S4, S2→S3, S1→S2
3. load the oldest waiting request into S1

When the shift leaves the pipeline empty the run is finished and no extra cycle is
counted, so N requests take exactly N + 4 cycles.

The clock (`SimulationContext.jsx`) keeps exactly one `setTimeout` alive while running.
It re-arms after every tick, is cleared on pause / reset / speed change / unmount, and
remembers the remaining time when you pause mid-cycle so resume continues the same cycle.
Ticks carry a `runId`, so a stray tick after Reset is ignored.

## Metric definitions

| Metric | Formula |
| --- | --- |
| Clock cycle | cycles elapsed |
| Latency | finishCycle − enterCycle + 1 (always 5: pipelining does not shorten one request) |
| Response time | finishCycle − createdCycle (includes queue wait) |
| Throughput | completed ÷ fully elapsed cycles |
| Utilization | busy stages ÷ 5 (current cycle; average over the run in Analytics) |
| Speedup | n·k ÷ (k + n − 1) |

## Test checklist (from the brief)

| # | Test | How to check |
| --- | --- | --- |
| 1 | One request S1→S5→completed | Create 1 request, press Start |
| 2 | Five requests in five stages | Create 5 requests, Start, look at cycle 5 |
| 3 | Pause | Clock, progress bars and tokens freeze |
| 4 | Resume | Continues from the same point in the cycle |
| 5 | Reset | Queue, pipeline, bookings, clock, metrics and charts cleared |
| 6 | Speed | 0.5x/1x/2x/4x = 2000/1000/500/250 ms per cycle |
| 7 | Demo mode | 10 requests, done in 14 cycles |
| 8 | Analytics | Charts grow by one point per cycle |

Tests 1–5 and 7 are also automated in `scripts/test-engine.mjs`.
