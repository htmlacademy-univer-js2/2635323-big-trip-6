import PointsPresenter from './presenter/points-presenter.js';
import FilterView from './view/filter-view.js';
import { render } from './render.js';

const pageMainElement = document.querySelector('.page-main');
const pageHeaderElement = document.querySelector('.page-header');

const tripControlFilters = pageHeaderElement.querySelector('.trip-controls__filters');
const tripEventsElement = pageMainElement.querySelector('.trip-events');

render(new FilterView(), tripControlFilters);

const pointsPresenter = new PointsPresenter(tripEventsElement);
pointsPresenter.init();
