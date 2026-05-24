import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import Model from './model/task-model.js';
import FilterModel from './model/filter-model.js';

const pointsModel = new Model();
const filterModel = new FilterModel();

const filterPresenter = new FilterPresenter({
  filterContainer: document.querySelector('.trip-controls__filters'),
  filterModel,
  pointsModel
});

const tripPresenter = new TripPresenter({
  pointsModel,
  filterModel
});

filterPresenter.init();
tripPresenter.init();
