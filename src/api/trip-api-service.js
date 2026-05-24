import ApiService from '../framework/api-service.js';

const Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

export default class TripApiService extends ApiService {
  get points() {
    return this._load({url: 'points', method: Method.GET})
      .then(ApiService.parseResponse)
      .then((points) => points.map(TripApiService.adaptPointToClient));
  }

  get destinations() {
    return this._load({url: 'destinations', method: Method.GET})
      .then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({url: 'offers', method: Method.GET})
      .then(ApiService.parseResponse)
      .then(TripApiService.adaptOffersToClient);
  }


  async createPoint(point) {
    const response = await this._load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(TripApiService.adaptPointToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'})
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return TripApiService.adaptPointToClient(parsedResponse);
  }

  async deletePoint(point) {
    await this._load({
      url: `points/${point.id}`,
      method: Method.DELETE
    });
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(TripApiService.adaptPointToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'})
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return TripApiService.adaptPointToClient(parsedResponse);
  }

  static adaptPointToClient(point) {
    return {
      id: point.id,
      type: point.type,
      destination: point.destination,
      dateFrom: new Date(point.date_from),
      dateTo: new Date(point.date_to),
      basePrice: point.base_price,
      offers: point.offers,
      isFavorite: point.is_favorite
    };
  }

  static adaptPointToServer(point) {
    return {
      id: point.id,
      type: point.type,
      destination: point.destination,
      offers: point.offers,
      'base_price': point.basePrice,
      'date_from': new Date(point.dateFrom).toISOString(),
      'date_to': new Date(point.dateTo).toISOString(),
      'is_favorite': point.isFavorite
    };
  }

  static adaptOffersToClient(offers) {
    return offers.reduce((accumulator, offerGroup) => {
      accumulator[offerGroup.type] = offerGroup.offers || [];
      return accumulator;
    }, {});
  }
}
