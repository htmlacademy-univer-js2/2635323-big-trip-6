import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {FilterType} from './const.js';

dayjs.extend(duration);

const DATE_FORMAT = 'MMM DD';
const TIME_FORMAT = 'HH:mm';
const DATE_TIME_ATTRIBUTE_FORMAT = 'YYYY-MM-DDTHH:mm';
const EDIT_FORM_DATE_FORMAT = 'DD/MM/YY HH:mm';
const INFO_DATE_FORMAT = 'DD MMM';

const humanizePointDate = (date) => dayjs(date).format(DATE_FORMAT).toUpperCase();

const humanizePointTime = (date) => dayjs(date).format(TIME_FORMAT);

const humanizeDateTime = (date) => dayjs(date).format(DATE_TIME_ATTRIBUTE_FORMAT);

const humanizeEditDate = (date) => dayjs(date).format(EDIT_FORM_DATE_FORMAT);

const calculateDuration = (dateFrom, dateTo) => {
  const pointDuration = dayjs.duration(dayjs(dateTo).diff(dayjs(dateFrom)));
  const days = Math.floor(pointDuration.asDays());
  const hours = pointDuration.hours();
  const minutes = pointDuration.minutes();

  if (days > 0) {
    return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }

  return `${String(minutes).padStart(2, '0')}M`;
};

const formatDateForTitle = (date) => dayjs(date).format(INFO_DATE_FORMAT).toUpperCase();

const getSortedPointsByDay = (points) => [...points].sort((pointA, pointB) => new Date(pointA.dateFrom) - new Date(pointB.dateFrom));

const getInfoTitle = (points, destinations) => {
  if (!points || !points.length) {
    return '';
  }

  let destinationNames = getSortedPointsByDay(points).map((point) => {
    const destination = destinations.find((d) => d.id === point.destination);
    return destination ? destination.name : '';
  });

  destinationNames = destinationNames.filter((element) => element);

  if (destinationNames.length <= 3) {
    return destinationNames.join(' — ');
  }

  const first = destinationNames[0];
  const last = destinationNames[destinationNames.length - 1];

  return `${first} —... — ${last}`;
};

const getInfoDates = (points) => {
  if (!points.length) {
    return null;
  }

  const sortedPoints = getSortedPointsByDay(points);

  return {
    start: formatDateForTitle(sortedPoints[0].dateFrom),
    end: formatDateForTitle(sortedPoints[sortedPoints.length - 1].dateTo)
  };
};

function getTotalCost(points, offers) {
  return points.reduce((total, point) => {
    const pointOffers = offers[point.type] || [];
    const selectedOffersCost = pointOffers
      .filter((offer) => point.offers.includes(offer.id))
      .reduce((sum, offer) => sum + offer.price, 0);
    return total + point.basePrice + selectedOffersCost;
  }, 0);
}

const sortPointDay = (pointA, pointB) => new Date(pointA.dateFrom) - new Date(pointB.dateFrom);

const sortPointTime = (pointA, pointB) => {
  const durationA = new Date(pointA.dateTo) - new Date(pointA.dateFrom);
  const durationB = new Date(pointB.dateTo) - new Date(pointB.dateFrom);

  return durationB - durationA;
};

const sortPointPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

const isPointFuture = (point) => new Date(point.dateFrom) > new Date();
const isPointPresent = (point) => new Date(point.dateFrom) <= new Date() && new Date(point.dateTo) >= new Date();
const isPointPast = (point) => new Date(point.dateTo) < new Date();

const filter = {
  [FilterType.EVERYTHING]: (points) => [...points],
  [FilterType.FUTURE]: (points) => points.filter((point) => isPointFuture(point)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPointPresent(point)),
  [FilterType.PAST]: (points) => points.filter((point) => isPointPast(point))
};

export {
  humanizePointDate,
  humanizePointTime,
  humanizeDateTime,
  humanizeEditDate,
  calculateDuration,
  getInfoTitle,
  getInfoDates,
  getTotalCost,
  sortPointDay,
  sortPointTime,
  sortPointPrice,
  filter
};
