import AbstractView from '../framework/view/abstract-view.js';
import {SortType} from '../const.js';

function createSortItemTemplate({type, title, checked = false, disabled = false}) {
  return (`<div class="trip-sort__item  trip-sort__item--${type}">
    <input
      id="sort-${type}"
      class="trip-sort__input  visually-hidden"
      type="radio"
      name="trip-sort"
      value="sort-${type}"
      data-sort-type="${type}"
      ${checked ? 'checked' : ''}
      ${disabled ? 'disabled' : ''}
    >
    <label class="trip-sort__btn" for="sort-${type}">${title}</label>
  </div>`);
}

function createSortTemplate(currentSortType) {
  const sortItems = [
    createSortItemTemplate({
      type: SortType.DAY,
      title: 'Day',
      checked: currentSortType === SortType.DAY
    }),
    createSortItemTemplate({
      type: 'event',
      title: 'Event',
      disabled: true
    }),
    createSortItemTemplate({
      type: SortType.TIME,
      title: 'Time',
      checked: currentSortType === SortType.TIME
    }),
    createSortItemTemplate({
      type: SortType.PRICE,
      title: 'Price',
      checked: currentSortType === SortType.PRICE
    }),
    createSortItemTemplate({
      type: 'offer',
      title: 'Offers',
      disabled: true
    })
  ].join('');

  return (
    `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
      ${sortItems}
    </form>`
  );
}

export default class SortView extends AbstractView {
  #currentSortType = null;
  #handleSortTypeChange = null;

  constructor({currentSortType, onSortTypeChange}) {
    super();
    this.#currentSortType = currentSortType;
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('change', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }

    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };
}
