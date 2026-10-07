/**
 * Mock data for CABFLOW.
 * Everything here is local: no maps API, no backend. Distances are computed
 * from approximate coordinates of well-known Chennai locations.
 */

export const LOCATIONS = [
  { name: 'SRM University', lat: 12.8231, lng: 80.0442 },
  { name: 'Chennai Central', lat: 13.0827, lng: 80.2757 },
  { name: 'Chennai Airport', lat: 12.9941, lng: 80.1709 },
  { name: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
  { name: 'Marina Beach', lat: 13.05, lng: 80.2824 },
  { name: 'Guindy', lat: 13.0067, lng: 80.2206 },
  { name: 'Velachery', lat: 12.9815, lng: 80.218 },
  { name: 'Tambaram', lat: 12.9249, lng: 80.1 },
  { name: 'Anna Nagar', lat: 13.085, lng: 80.2101 },
  { name: 'OMR Tech Park', lat: 12.9165, lng: 80.2295 },
  { name: 'Egmore', lat: 13.0732, lng: 80.2609 },
  { name: 'Adyar', lat: 13.0012, lng: 80.2565 },
];

export const PASSENGERS = [
  'Sai', 'Ananya', 'Rahul', 'Priya', 'Karthik', 'Meera', 'Arjun', 'Divya',
  'Vikram', 'Sneha', 'Rohan', 'Kavya', 'Aditya', 'Nisha', 'Harish', 'Lakshmi',
  'Farhan', 'Isha', 'Varun', 'Pooja',
];

export const CAB_TYPES = [
  { id: 'Mini', base: 40, perKm: 11, seats: 4, note: 'Hatchback · 4 seats' },
  { id: 'Sedan', base: 55, perKm: 14, seats: 4, note: 'Sedan · 4 seats' },
  { id: 'SUV', base: 80, perKm: 18, seats: 6, note: 'SUV · 6 seats' },
];

const findLocation = (name) => LOCATIONS.find((l) => l.name === name);

/** Great-circle distance in km, scaled by a road factor so it reads like driving distance. */
export function roadDistanceKm(fromName, toName) {
  const a = findLocation(fromName);
  const b = findLocation(toName);
  if (!a || !b) return 0;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const straight = 2 * R * Math.asin(Math.sqrt(h));
  return Math.round(straight * 1.3 * 10) / 10;
}

export function estimateFare(cabType, distanceKm) {
  const cab = CAB_TYPES.find((c) => c.id === cabType) ?? CAB_TYPES[0];
  return Math.round(cab.base + cab.perKm * distanceKm);
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

/**
 * Build a booking "draft". IDs are assigned later inside the simulation
 * reducer, so rapid clicks can never produce duplicate IDs.
 */
export function makeBookingDraft({ passenger, pickup, destination, cabType }) {
  const distanceKm = roadDistanceKm(pickup, destination);
  return {
    passenger: passenger.trim().replace(/\s+/g, ' '),
    pickup,
    destination,
    cabType,
    distanceKm,
    fare: estimateFare(cabType, distanceKm),
    etaMin: 2 + Math.floor(Math.random() * 8),
  };
}

export function randomBookingDraft() {
  const pickup = pick(LOCATIONS).name;
  let destination = pick(LOCATIONS).name;
  while (destination === pickup) destination = pick(LOCATIONS).name;
  return makeBookingDraft({
    passenger: pick(PASSENGERS),
    pickup,
    destination,
    cabType: pick(CAB_TYPES).id,
  });
}

export const randomBookingDrafts = (count) =>
  Array.from({ length: count }, () => randomBookingDraft());

/** Returns { field: message }. An empty object means the booking is valid. */
export function validateBooking({ passenger, pickup, destination, cabType }) {
  const errors = {};
  const name = (passenger ?? '').trim();
  if (!name) errors.passenger = 'Enter the passenger name.';
  else if (name.length < 2) errors.passenger = 'Name needs at least 2 characters.';
  else if (name.length > 30) errors.passenger = 'Keep the name under 30 characters.';
  else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name))
    errors.passenger = 'Use letters, spaces, dots, hyphens or apostrophes.';

  if (!findLocation(pickup)) errors.pickup = 'Choose a pickup location.';
  if (!findLocation(destination)) errors.destination = 'Choose a destination.';
  else if (pickup === destination) errors.destination = 'Destination must be different from pickup.';

  if (!CAB_TYPES.some((c) => c.id === cabType)) errors.cabType = 'Choose a cab type.';
  return errors;
}

/** Compact place label for small cards, e.g. "SRM" instead of "SRM University". */
export const shortPlace = (name = '') =>
  name.replace(/ (University|Central|Airport|Beach|Tech Park)$/, '');
