import FilterView from '../view/filter-view.js';
import {render, replace, remove} from '../framework/render.js';
import {FilterType, UpdateType} from '../const.js';
import {filter} from '../utils.js';

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #pointsModel = null;
  #filterComponent = null;

  constructor({filterContainer, filterModel, pointsModel}) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const filtersInfo = this.#getFiltersInfo();
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FilterView({
      filtersInfo,
      currentFilterType: this.#filterModel.filter,
      onFilterTypeChange: this.#handleFilterTypeChange
    });

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #getFiltersInfo() {
    const points = this.#pointsModel.points;

    return {
      [FilterType.EVERYTHING]: filter[FilterType.EVERYTHING](points).length,
      [FilterType.FUTURE]: filter[FilterType.FUTURE](points).length,
      [FilterType.PRESENT]: filter[FilterType.PRESENT](points).length,
      [FilterType.PAST]: filter[FilterType.PAST](points).length
    };
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
