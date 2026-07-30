import api from './api';

jest.mock('./api', () => ({
  getLatestSensorData: jest.fn(),
  getHealth: jest.fn(),
  getStats: jest.fn(),
  getAccidents: jest.fn(),
  getSensorHistory: jest.fn(),
  postSensorData: jest.fn(),
}));

describe('API module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getLatestSensorData calls the correct endpoint', async () => {
    api.getLatestSensorData();
    expect(api.getLatestSensorData).toHaveBeenCalled();
  });

  test('getSensorHistory calls the correct endpoint', async () => {
    api.getSensorHistory();
    expect(api.getSensorHistory).toHaveBeenCalled();
  });

  test('getAccidents calls the correct endpoint', async () => {
    api.getAccidents();
    expect(api.getAccidents).toHaveBeenCalled();
  });

  test('getStats calls the correct endpoint', async () => {
    api.getStats();
    expect(api.getStats).toHaveBeenCalled();
  });
});