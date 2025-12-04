
// Enumeration for View Navigation
export enum View {
  HOME = 'HOME',
  PAIRING_MENU = 'PAIRING_MENU',
  PAIRING_STATUS = 'PAIRING_STATUS',
  PAIRING_ADD = 'PAIRING_ADD',
  CONTROL_ROOM_LIST = 'CONTROL_ROOM_LIST',
  CONTROL_ROOM_DETAIL = 'CONTROL_ROOM_DETAIL',
}

// Data Models
export interface SensorData {
  time: string;
  value: number;
}

export interface Room {
  id: string;
  name: string;
  currentTemp: number;
  targetTemp: number;
  isValveOpen: boolean;
  sensorCount: number;
  history: SensorData[];
}

export interface Device {
  id: string;
  name: string;
  type: string;
  mac: string;
}

// Inspector Types
export interface InspectData {
  tagName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  bgRgb565: string;
  textColor: string;
  textRgb565: string;
  text: string;
  classes: string;
  lvSymbol?: string; // Standard LVGL Symbol macro if applicable
}
