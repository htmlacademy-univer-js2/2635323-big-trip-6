const EVENT_TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant'
];

const DEFAULT_POINT_TYPE = 'Flight';

const SortType = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price'
};

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT'
};

const UpdateType = {
  INIT: 'INIT',
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR'
};

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export {
  EVENT_TYPES,
  DEFAULT_POINT_TYPE,
  SortType,
  FilterType,
  UserAction,
  UpdateType,
  capitalize
};
