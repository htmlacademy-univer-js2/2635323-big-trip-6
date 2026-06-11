import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import TripApiService from './api/trip-api-service.js';

const AUTHORIZATION = `Basic ${crypto.randomUUID()}`;
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

const tripApiService = new TripApiService(END_POINT, AUTHORIZATION);
const pointsModel = new PointsModel({apiService: tripApiService});
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
pointsModel.init();

