import Observable from '../framework/observable.js';
import {UpdateType} from '../const.js';

export default class Model extends Observable {
  #apiService = null;
  #points = [];
  #destinations = [];
  #offers = {};
  #isLoading = true;
  #isLoadingError = false;

  constructor({apiService}) {
    super();
    this.#apiService = apiService;
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  get isLoading() {
    return this.#isLoading;
  }

  get isLoadingError() {
    return this.#isLoadingError;
  }

  async init() {
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#apiService.points,
        this.#apiService.destinations,
        this.#apiService.offers
      ]);

      this.#points = points;
      this.#destinations = destinations;
      this.#offers = offers;
      this.#isLoadingError = false;
    } catch (err) {
      this.#points = [];
      this.#destinations = [];
      this.#offers = {};
      this.#isLoadingError = true;
    }

    this.#isLoading = false;
    this._notify(UpdateType.INIT);
  }

  setPoints(updateType, points) {
    this.#points = points;
    this._notify(updateType);
  }

  async updatePoint(updateType, update) {
    const response = await this.#apiService.updatePoint(update);
    const index = this.#points.findIndex((point) => point.id === response.id);

    if (index === -1) {
      throw new Error('Can\'t update non-existing point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      response,
      ...this.#points.slice(index + 1)
    ];

    this._notify(updateType, response);
  }

  addPoint() {
    return Promise.resolve();
  }

  deletePoint() {
    return Promise.resolve();
  }
}
