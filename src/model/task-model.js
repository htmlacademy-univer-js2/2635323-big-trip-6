import { generateMockData } from '../mock/task';

export default class Model {
  constructor() {
    const mockData = generateMockData();
    this.points = mockData.points;
    this.destinations = mockData.destinations;
    this.offers = mockData.offers;
  }
}
