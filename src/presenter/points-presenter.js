import MakeFormView from '../view/make-form-view.js';
import EditFormView from '../view/edit-form-view.js';
import PointView from '../view/point-view.js';
import SortView from '../view/sort-view.js';
import { render } from '../render.js';

const COUNT_POINT = 3;

export default class PointsPresenter {
  constructor(pointsEventsContainer) {
    this.pointsEventsContainer = pointsEventsContainer;
  }

  init() {
    render(new SortView(), this.pointsEventsContainer);

    render(new EditFormView(), this.pointsEventsContainer);

    render(new MakeFormView(), this.pointsEventsContainer);

    for (let i = 0; i < COUNT_POINT; i++) {
      render(new PointView(), this.pointsEventsContainer);
    }
  }
}
