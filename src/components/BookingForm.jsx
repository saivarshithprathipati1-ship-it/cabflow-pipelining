import { useId, useState } from 'react';
import { ListPlus, Plus } from 'lucide-react';
import { CAB_TYPES, LOCATIONS, estimateFare, makeBookingDraft, roadDistanceKm, validateBooking } from '../data/bookings.js';
import { useSimulation } from '../simulation/SimulationContext.jsx';

const EMPTY = { passenger: '', pickup: 'SRM University', destination: 'Chennai Central', cabType: 'Sedan' };

export default function BookingForm() {
  const { actions } = useSimulation();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const uid = useId();
  const fid = (name) => `${uid}-${name}`;

  const update = (name) => (e) => {
    const next = { ...values, [name]: e.target.value };
    setValues(next);
    if (touched) setErrors(validateBooking(next));
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    const found = validateBooking(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(fid(Object.keys(found)[0]))?.focus();
      return;
    }
    actions.addRequest(makeBookingDraft(values));
    setValues((v) => ({ ...v, passenger: '' }));
    setTouched(false);
  };

  const km = values.pickup !== values.destination ? roadDistanceKm(values.pickup, values.destination) : 0;

  const fieldError = (name) =>
    errors[name] ? (
      <p id={`${fid(name)}-err`} className="mt-1 text-xs text-red-300">
        {errors[name]}
      </p>
    ) : null;

  const a11y = (name) => ({
    id: fid(name),
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${fid(name)}-err` : undefined,
  });

  return (
    <section aria-labelledby={`${uid}-title`} className="panel p-4 sm:p-5">
      <h2 id={`${uid}-title`} className="panel-title">New booking request</h2>
      <p className="mb-4 mt-1 text-xs text-slate-400">Each request gets the next ID and joins the waiting queue.</p>

      <form onSubmit={submit} noValidate className="space-y-3">
        <div>
          <label htmlFor={fid('passenger')} className="mb-1 block text-xs font-medium text-slate-300">
            Passenger name
          </label>
          <input
            {...a11y('passenger')}
            className="field"
            value={values.passenger}
            onChange={update('passenger')}
            placeholder="e.g. Sai"
            autoComplete="off"
            maxLength={40}
          />
          {fieldError('passenger')}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={fid('pickup')} className="mb-1 block text-xs font-medium text-slate-300">
              Pickup
            </label>
            <select {...a11y('pickup')} className="field" value={values.pickup} onChange={update('pickup')}>
              {LOCATIONS.map((l) => (
                <option key={l.name}>{l.name}</option>
              ))}
            </select>
            {fieldError('pickup')}
          </div>
          <div>
            <label htmlFor={fid('destination')} className="mb-1 block text-xs font-medium text-slate-300">
              Destination
            </label>
            <select {...a11y('destination')} className="field" value={values.destination} onChange={update('destination')}>
              {LOCATIONS.map((l) => (
                <option key={l.name}>{l.name}</option>
              ))}
            </select>
            {fieldError('destination')}
          </div>
        </div>

        <fieldset>
          <legend className="mb-1 text-xs font-medium text-slate-300">Cab type</legend>
          <div className="grid grid-cols-3 gap-2">
            {CAB_TYPES.map((c) => {
              const selected = values.cabType === c.id;
              return (
                <label
                  key={c.id}
                  className={`cursor-pointer rounded-xl border px-2 py-2 text-center transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cab ${
                    selected ? 'border-cab/70 bg-cab/10 text-paper' : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name={`${uid}-cab`}
                    value={c.id}
                    checked={selected}
                    onChange={update('cabType')}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold">{c.id}</span>
                  <span className="block text-[11px] text-slate-400 tabular">
                    ₹{km ? estimateFare(c.id, km) : '—'}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <button type="submit" className="btn-cab w-full">
          <Plus size={16} aria-hidden="true" /> Create request
        </button>
      </form>

      <div className="mt-4 border-t border-white/5 pt-4">
        <p className="mb-2 text-xs text-slate-400">Simulate a rush of passengers</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-ghost" onClick={() => actions.addRandom(5)}>
            <ListPlus size={16} aria-hidden="true" /> Create 5 requests
          </button>
          <button type="button" className="btn-ghost" onClick={() => actions.addRandom(10)}>
            <ListPlus size={16} aria-hidden="true" /> Create 10 requests
          </button>
        </div>
      </div>
    </section>
  );
}
