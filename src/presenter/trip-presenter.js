import SortView from '../view/sort-view.js';
import TripPoint from '../view/trip-point-view.js';
import PointListView from '../view/point-list-view.js';
import PointPresenter from './point-presenter.js';
import EditPointView from '../view/edit-point-view.js';
import NoPointsView from '../view/no-points-view.js';
import LoadingView from '../view/loading-view.js';
import FailedLoadView from '../view/failed-load-view.js';
import {render, replace, remove, RenderPosition} from '../framework/render.js';
import {EVENT_TYPES, FilterType, SortType, UpdateType, UserAction} from '../const.js';
import {
  filter,
  getInfoTitle,
  getInfoDates,
  getTotalCost,
  sortPointDay,
  sortPointTime,
  sortPointPrice
} from '../utils.js';

export default class TripPresenter {
  #pointPresenter = new Map();
  #pointsListContainer = null;
  #pointsModel = null;
  #filterModel = null;
  #tripInfoComponent = null;
  #sortComponent = null;
  #pointListComponent = null;
  #noPointsComponent = null;
  #loadingComponent = null;
  #failedLoadComponent = null;
  #newPointComponent = null;
  #currentSortType = SortType.DAY;
  #isNewPointFormOpen = false;

  constructor({pointsModel, filterModel}) {
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;

    this.eventsContainer = document.querySelector('.trip-events');
    this.mainContainer = document.querySelector('.trip-main');
    this.newPointButton = document.querySelector('.trip-main__event-add-btn');

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const currentFilter = this.#filterModel.filter;
    const filteredPoints = filter[currentFilter](this.#pointsModel.points);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredPoints.sort(sortPointTime);
      case SortType.PRICE:
        return filteredPoints.sort(sortPointPrice);
      case SortType.DAY:
      default:
        return filteredPoints.sort(sortPointDay);
    }
  }

  init() {
    this.#renderTrip();
    this.newPointButton.addEventListener('click', this.#newPointButtonClickHandler);
  }

  #renderInfo() {
    if (this.#pointsModel.isLoading || this.#pointsModel.isLoadingError) {
      return;
    }

    const points = this.#pointsModel.points;
    const destinations = this.#pointsModel.destinations;
    const offers = this.#pointsModel.offers;

    const infoData = {
      title: getInfoTitle(points, destinations),
      dates: getInfoDates(points) || {},
      totalCost: getTotalCost(points, offers)
    };

    const prevTripInfoComponent = this.#tripInfoComponent;
    this.#tripInfoComponent = new TripPoint(infoData);

    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.mainContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  }

  #renderTrip({renderNewPoint = false} = {}) {
    if (this.#pointsModel.isLoading) {
      this.newPointButton.disabled = true;
      this.#renderLoading();
      return;
    }

    if (this.#pointsModel.isLoadingError) {
      this.newPointButton.disabled = true;
      this.#renderFailedLoad();
      return;
    }

    this.newPointButton.disabled = false;

    const points = this.points;

    if (!points.length && !renderNewPoint) {
      this.#renderNoPoints();
      return;
    }

    if (points.length) {
      this.#renderSort();
    }

    this.#pointListComponent = new PointListView();
    render(this.#pointListComponent, this.eventsContainer);
    this.#pointsListContainer = this.#pointListComponent.element;

    if (renderNewPoint) {
      this.#renderNewPoint();
    }

    this.#renderPoints(points);
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, this.eventsContainer, RenderPosition.AFTERBEGIN);
  }

  #renderLoading() {
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.eventsContainer);
  }

  #renderFailedLoad() {
    this.#failedLoadComponent = new FailedLoadView();
    render(this.#failedLoadComponent, this.eventsContainer);
  }

  #renderNoPoints() {
    this.#noPointsComponent = new NoPointsView({filterType: this.#filterModel.filter});
    render(this.#noPointsComponent, this.eventsContainer);
  }

  #renderPoints(points) {
    points.forEach((point) => {
      this.#renderPoint(point, this.#pointsModel.destinations, this.#pointsModel.offers);
    });
  }

  #renderPoint(point, destinations, offers) {
    const pointPresenter = new PointPresenter({
      container: this.#pointsListContainer,
      destinations,
      offers,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(point);
    this.#pointPresenter.set(point.id, pointPresenter);
  }

  #renderNewPoint() {
    this.#isNewPointFormOpen = true;
    this.newPointButton.disabled = true;

    this.#newPointComponent = new EditPointView({
      point: this.#createNewPoint(),
      destinations: this.#pointsModel.destinations,
      offers: this.#pointsModel.offers,
      onFormSubmit: this.#handleNewPointSubmit,
      onArrowClick: this.#closeNewPointForm,
      onCancelClick: this.#closeNewPointForm,
      onDeleteClick: this.#closeNewPointForm,
    });

    render(this.#newPointComponent, this.#pointsListContainer, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #createNewPoint() {
    const now = new Date();
    const dateTo = new Date(now);
    dateTo.setHours(dateTo.getHours() + 1);

    return {
      type: EVENT_TYPES[5],
      destination: '',
      dateFrom: now,
      dateTo,
      basePrice: 0,
      offers: [],
      isFavorite: false
    };
  }

  #clearTrip() {
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();

    remove(this.#sortComponent);
    remove(this.#pointListComponent);
    remove(this.#noPointsComponent);
    remove(this.#loadingComponent);
    remove(this.#failedLoadComponent);
    remove(this.#newPointComponent);

    this.#sortComponent = null;
    this.#pointListComponent = null;
    this.#noPointsComponent = null;
    this.#loadingComponent = null;
    this.#failedLoadComponent = null;
    this.#newPointComponent = null;
    this.#pointsListContainer = null;
    this.#isNewPointFormOpen = false;
    this.newPointButton.disabled = this.#pointsModel.isLoading || this.#pointsModel.isLoadingError;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #removeNewPointForm() {
    remove(this.#newPointComponent);
    this.#newPointComponent = null;
    this.#isNewPointFormOpen = false;
    this.newPointButton.disabled = this.#pointsModel.isLoading || this.#pointsModel.isLoadingError;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #closeNewPointForm = () => {
    if (!this.#isNewPointFormOpen) {
      return;
    }

    this.#removeNewPointForm();

    if (!this.points.length) {
      remove(this.#pointListComponent);
      this.#pointListComponent = null;
      this.#pointsListContainer = null;
      this.#renderNoPoints();
    }
  };

  #handleModeChange = () => {
    this.#pointPresenter.forEach((presenter) => presenter.resetView());

    if (this.#isNewPointFormOpen) {
      this.#removeNewPointForm();
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenter.get(data.id)?.init(data);
        break;
      case UpdateType.INIT:
      case UpdateType.MINOR:
      case UpdateType.MAJOR:
        this.#clearTrip();
        this.#currentSortType = SortType.DAY;
        this.#renderInfo();
        this.#renderTrip();
        break;
    }
  };

  #handleViewAction = async (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        await this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        await this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        await this.#pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleNewPointSubmit = (point) => {
    this.#handleViewAction(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point
    );
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearTrip();
    this.#renderTrip();
  };

  #newPointButtonClickHandler = () => {
    if (this.#isNewPointFormOpen || this.#pointsModel.isLoading || this.#pointsModel.isLoadingError) {
      return;
    }

    this.#handleModeChange();
    this.#currentSortType = SortType.DAY;

    if (this.#filterModel.filter !== FilterType.EVERYTHING) {
      this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    } else {
      this.#clearTrip();
    }

    this.#renderTrip({renderNewPoint: true});
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#closeNewPointForm();
    }
  };
}
