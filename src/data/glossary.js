/** Short definitions shown in tooltips wherever a COA term appears. */
export const GLOSSARY = {
  pipelining:
    'Splitting a job into stages so several jobs can be worked on at once, each in a different stage.',
  stage:
    'One step of the booking workflow with its own hardware/worker. Each stage holds at most one request per cycle.',
  cycle:
    'One tick of the pipeline clock. On every tick, each request moves forward exactly one stage.',
  latency:
    'Cycles one request spends inside the pipeline, from entering S1 to finishing S5. Here it is always 5.',
  throughput:
    'Completed requests ÷ elapsed cycles. A full pipeline approaches 1 booking per cycle.',
  utilization:
    'Busy stages ÷ total stages. 100% means all five stages are working on different requests.',
  speedup:
    'Sequential cycles ÷ pipelined cycles. For n requests on k stages: n·k ÷ (k + n − 1).',
  fill:
    'The first k − 1 cycles, when the pipeline is still filling and some stages are empty.',
  drain:
    'The last k − 1 cycles, when no new requests enter and the pipeline empties out.',
  response:
    'Cycles from the moment a booking is created until it is confirmed, including time spent waiting in the queue.',
};
