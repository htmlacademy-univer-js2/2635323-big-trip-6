import AbstractView from '../framework/view/abstract-view.js';
import {FilterType} from '../const.js';

const FILTER_TITLES = {
  [FilterType.EVERYTHING]: 'Everything',
  [FilterType.FUTURE]: 'Future',
  [FilterType.PRESENT]: 'Present',
  [FilterType.PAST]: 'Past'
};

function createFilterItemTemplate(filterType, currentFilterType, filtersInfo, isDisabled) {
  const isChecked = filterType === currentFilterType;
  const isFilterDisabled = isDisabled || filtersInfo[filterType] === 0;

  return (`<div class="trip-filters__filter">
    <input
      id="filter-${filterType}"
      class="trip-filters__filter-input visually-hidden"
      type="radio"
      name="trip-filter"
      value="${filterType}"
      ${isChecked ? 'checked' : ''}
      ${isFilterDisabled ? 'disabled' : ''}
    >
    <label class="trip-filters__filter-label" for="filter-${filterType}">${FILTER_TITLES[filterType]}</label>
  </div>`);
}

function createFilterTemplate(filtersInfo, currentFilterType, isDisabled) {
  const filterItems = Object.values(FilterType)
    .map((filterType) => createFilterItemTemplate(filterType, currentFilterType, filtersInfo, isDisabled))
    .join('');

  return (`<form class="trip-filters" action="#" method="get">
    ${filterItems}
    <button class="visually-hidden" type="submit">Accept filter</button>
  </form>`);
}

export default class FilterView extends AbstractView {
  #filtersInfo = null;
  #currentFilterType = null;
  #isDisabled = false;
  #handleFilterTypeChange = null;

  constructor({filtersInfo, currentFilterType, isDisabled = false, onFilterTypeChange}) {
    super();
    this.#filtersInfo = filtersInfo;
    this.#currentFilterType = currentFilterType;
    this.#isDisabled = isDisabled;
    this.#handleFilterTypeChange = onFilterTypeChange;

    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  get template() {
    return createFilterTemplate(this.#filtersInfo, this.#currentFilterType, this.#isDisabled);
  }

  #filterTypeChangeHandler = (evt) => {
    evt.preventDefault();

    if (this.#isDisabled) {
      return;
    }

    this.#handleFilterTypeChange(evt.target.value);
  };
}
