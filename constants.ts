import { Room, Device } from './types';

// Mock Device Data
export const MOCK_DEVICES: Device[] = [
  { id: '1', name: 'Temp Sensor A1', type: 'Sensor', mac: 'AA:BB:CC:01' },
  { id: '2', name: 'Steam Valve V1', type: 'Actuator', mac: 'AA:BB:CC:02' },
  { id: '3', name: 'Temp Sensor A2', type: 'Sensor', mac: 'AA:BB:CC:03' },
  { id: '4', name: 'Main Controller', type: 'Gateway', mac: 'AA:BB:CC:FF' },
];

// Mock Chart Data Generator
const generateHistory = (baseTemp: number) => {
  return Array.from({ length: 10 }, (_, i) => ({
    time: `${i * 10}m`,
    value: baseTemp + (Math.random() * 2 - 1), // Random fluctuation
  }));
};

// Mock Rooms Data
export const MOCK_ROOMS: Room[] = [
  {
    id: 'living_room',
    name: 'Living Room',
    currentTemp: 24.5,
    targetTemp: 25.0,
    isValveOpen: true,
    sensorCount: 2,
    history: generateHistory(24.5),
  },
  {
    id: 'bedroom_master',
    name: 'Master Bedroom',
    currentTemp: 21.2,
    targetTemp: 22.0,
    isValveOpen: false,
    sensorCount: 1,
    history: generateHistory(21.2),
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    currentTemp: 26.8,
    targetTemp: 24.0,
    isValveOpen: true,
    sensorCount: 3,
    history: generateHistory(26.8),
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    currentTemp: 23.0,
    targetTemp: 25.0,
    isValveOpen: false,
    sensorCount: 1,
    history: generateHistory(23.0),
  },
];