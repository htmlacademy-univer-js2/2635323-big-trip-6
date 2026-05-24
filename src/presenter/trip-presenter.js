import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import TripPoint from '../view/trip-point-view.js';
import PointListView from '../view/point-list-view.js';
import PointPresenter from './point-presenter.js';
import NoPointsView from '../view/no-points-view.js';
import { render, RenderPosition } from '../framework/render.js';
import {SortType} from '../const.js';
import {
  getInfoTitle,
  getInfoDates,
  getTotalCost,
  countFuturePoints,
  countPresentPoints,
  countPastPoints,
  sortPointDay,
  sortPointTime,
  sortPointPrice
} from '../utils.js';

export default class TripPresenter {
  #pointPresenter = new Map();
  #pointsListContainer = null;
  #currentSortType = SortType.DAY;

  constructor(tripModel) {
    this.model = tripModel;

    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.eventsContainer = document.querySelector('.trip-events');
    this.mainContainer = document.querySelector('.trip-main');
  }

  get points() {
    const points = [...this.model.points];

    switch (this.#currentSortType) {
      case SortType.TIME:
        return points.sort(sortPointTime);
      case SortType.PRICE:
        return points.sort(sortPointPrice);
      case SortType.DAY:
      default:
        return points.sort(sortPointDay);
    }
  }

  init() {
    const { points, destinations, offers } = this.model;

    const infoData = {
      title: getInfoTitle(points, destinations),
      dates: getInfoDates(points),
      totalCost: getTotalCost(points, offers)
    };

    const filtersInfo = {
      future: countFuturePoints(points),
      present: countPresentPoints(points),
      past: countPastPoints(points)
    };

    render(new TripPoint(infoData), this.mainContainer, RenderPosition.AFTERBEGIN);
    render(new FilterView(filtersInfo), this.filtersContainer);

    if (!points || !points.length) {
      render(new NoPointsView(), this.eventsContainer);
      return;
    }

    render(new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    }), this.eventsContainer, RenderPosition.AFTERBEGIN);

    const pointListView = new PointListView();
    render(pointListView, this.eventsContainer);
    this.#pointsListContainer = pointListView.element;

    this.#renderPoints();
  }

  #renderPoints() {
    this.points.forEach((point) => {
      this.#renderPoint(point, this.model.destinations, this.model.offers);
    });
  }

  #renderPoint(point, destinations, offers) {
    const pointPresenter = new PointPresenter({
      container: this.#pointsListContainer,
      destinations,
      offers,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(point);
    this.#pointPresenter.set(point.id, pointPresenter);
  }

  #clearPointList() {
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();
  }

  #handlePointChange = (updatedPoint) => {
    this.model.updatePoint(updatedPoint);
    this.#pointPresenter.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenter.forEach((presenter) => presenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearPointList();
    this.#renderPoints();
  };
}
