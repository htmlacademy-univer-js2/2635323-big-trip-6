import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import {Russian} from 'flatpickr/dist/l10n/ru.js';
import {EVENT_TYPES} from '../const.js';
import {humanizeEditDate} from '../utils.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';

const DateFormat = {
  DATE_PICKER: 'd/m/y H:i',
};

function createEditPointTemplate(point = {}, destinations = [], offers = {}) {
  const {
    type = EVENT_TYPES[0],
    destination: destinationId = '',
    dateFrom = new Date(),
    dateTo = new Date(),
    basePrice = 0,
    offers: selectedOfferIds = [],
  } = point;

  const destination = destinations.find((dest) => dest.id === destinationId) || null;
  const typeOffers = offers[type] || [];
  const selectedOffers = typeOffers.filter((offer) => selectedOfferIds.includes(offer.id));

  const eventTypesTemplate = EVENT_TYPES.map((eventType) => `
    <div class="event__type-item">
      <input
        id="event-type-${eventType}-1"
        class="event__type-input visually-hidden"
        type="radio"
        name="event-type"
        value="${eventType}"
        ${eventType === type ? 'checked' : ''}
      >
      <label class="event__type-label event__type-label--${eventType}" for="event-type-${eventType}-1">
        ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}
      </label>
    </div>
  `).join('');

  const destinationsTemplate = destinations.map((dest) => `
    <option value="${dest.name}"></option>
  `).join('');

  const offersTemplate = typeOffers.length > 0 ? `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${typeOffers.map((offer) => `
          <div class="event__offer-selector">
            <input
              class="event__offer-checkbox visually-hidden"
              id="event-offer-${offer.id}"
              type="checkbox"
              name="event-offer-${offer.id}"
              value="${offer.id}"
              ${selectedOffers.some((selected) => selected.id === offer.id) ? 'checked' : ''}
            >
            <label class="event__offer-label" for="event-offer-${offer.id}">
              <span class="event__offer-title">${offer.title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  const destinationDescriptionTemplate = destination?.description ? `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${destination.description}</p>
      ${destination.pictures.length > 0 ? `
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${destination.pictures.map((pic) => `
              <img class="event__photo" src="${pic.src}" alt="${pic.description}">
            `).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  ` : '';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${eventTypesTemplate}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">
              ${type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
            <input
              class="event__input event__input--destination"
              id="event-destination-1"
              type="text"
              name="event-destination"
              value="${destination ? destination.name : ''}"
              list="destination-list-1"
              required
            >
            <datalist id="destination-list-1">
              ${destinationsTemplate}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input
              class="event__input event__input--time"
              id="event-start-time-1"
              type="text"
              name="event-start-time"
              value="${humanizeEditDate(dateFrom)}"
            >
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input
              class="event__input event__input--time"
              id="event-end-time-1"
              type="text"
              name="event-end-time"
              value="${humanizeEditDate(dateTo)}"
            >
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-1"
              type="number"
              name="event-price"
              value="${basePrice}"
              min="0"
              required
            >
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${point.id ? 'Delete' : 'Cancel'}</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          ${offersTemplate}
          ${destinationDescriptionTemplate}
        </section>
      </form>
    </li>
  `;
}

export default class EditPointView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #handleFormSubmit = null;
  #handleArrowClick = null;
  #handleDeleteClick = null;
  #handleCancelClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({point = null, destinations = [], offers = {}, onFormSubmit, onArrowClick, onDeleteClick, onCancelClick}) {
    super();
    this._setState(EditPointView.parsePointToState(point));
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleArrowClick = onArrowClick;
    this.#handleDeleteClick = onDeleteClick;
    this.#handleCancelClick = onCancelClick;

    this._restoreHandlers();
  }

  get template() {
    return createEditPointTemplate(this._state, this.#destinations, this.#offers);
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  _restoreHandlers() {
    this.element.querySelector('.event--edit')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#arrowClickHandler);

    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);

    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);

    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);

    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#resetClickHandler);

    this.#setDatepickers();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    const point = {
      ...this._state,
      ...this.#getFormData()
    };

    if (!this.#destinations.some((destination) => destination.id === point.destination)) {
      return;
    }

    this.#handleFormSubmit(point);
  };

  #arrowClickHandler = () => {
    this.#handleArrowClick?.();
  };

  #resetClickHandler = (evt) => {
    evt.preventDefault();

    if (this._state.id) {
      this.#handleDeleteClick(this._state);
      return;
    }

    this.#handleCancelClick();
  };

  #priceInputHandler = (evt) => {
    evt.target.value = evt.target.value.replace(/[^0-9]/g, '');
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();

    if (!evt.target.classList.contains('event__type-input')) {
      return;
    }

    this.updateElement({
      ...this.#getFormData(),
      type: evt.target.value,
      offers: []
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();

    const selectedDestination = this.#destinations.find((destination) => destination.name === evt.target.value);

    if (!selectedDestination) {
      evt.target.value = '';
      this.updateElement({
        ...this.#getFormData(),
        destination: ''
      });
      return;
    }

    this.updateElement({
      ...this.#getFormData(),
      destination: selectedDestination.id
    });
  };

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({dateFrom: userDate});
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({dateTo: userDate});
  };

  #setDatepickers() {
    this.#datepickerFrom = flatpickr(
      this.element.querySelector('[name="event-start-time"]'),
      {
        dateFormat: DateFormat.DATE_PICKER,
        defaultDate: this._state.dateFrom,
        enableTime: true,
        locale: Russian,
        'time_24hr': true,
        onChange: this.#dateFromChangeHandler,
      },
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('[name="event-end-time"]'),
      {
        dateFormat: DateFormat.DATE_PICKER,
        defaultDate: this._state.dateTo,
        enableTime: true,
        locale: Russian,
        'time_24hr': true,
        onChange: this.#dateToChangeHandler,
      },
    );
  }

  #getFormData() {
    const destinationName = this.element.querySelector('.event__input--destination').value;
    const selectedDestination = this.#destinations.find((destination) => destination.name === destinationName);
    const checkedOffers = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'))
      .map((offer) => offer.value);

    return {
      type: this._state.type,
      basePrice: Number(this.element.querySelector('.event__input--price').value),
      destination: selectedDestination ? selectedDestination.id : this._state.destination,
      dateFrom: this._state.dateFrom,
      dateTo: this._state.dateTo,
      offers: checkedOffers
    };
  }

  static parsePointToState(point) {
    return {...point};
  }
}
