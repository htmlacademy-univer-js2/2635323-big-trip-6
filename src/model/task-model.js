import { generateMockData } from '../mock/task';

export default class Model {
  constructor() {
    const mockData = generateMockData();
    this.points = mockData.points;
    this.destinations = mockData.destinations;
    this.offers = mockData.offers;
  }

  updatePoint(update) {
    const index = this.points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update non-existing point');
    }

    this.points = [
      ...this.points.slice(0, index),
      update,
      ...this.points.slice(index + 1)
    ];
  }
}
