
export const vehicleTypes = ['bakkie', 'truck', 'bike', 'car_2_door', 'car_4_door'] as const;
export type VehicleType = typeof vehicleTypes[number];

export interface DamageReport {
  id: string;
  partId: string;
  partName: string;
  description: string;
  reportedBy: string;
  date: string;
  isChecklistDone: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licenseExpiry: string;
  nextService: string;
  lastService: string;
  lastServiceBy: string;
  damages: DamageReport[];
}

export const initialVehicles: Vehicle[] = [
  {
    id: 'bakkie-01',
    name: 'Ford Ranger Bakkie',
    type: 'bakkie',
    licenseExpiry: '2025-08-31',
    nextService: '2025-02-15',
    lastService: '2024-02-20',
    lastServiceBy: 'Ford Dealership',
    damages: [
        { id: 'd1', partId: 'front-bumper', partName: 'Front Bumper', description: 'Minor scratch on the left side.', reportedBy: 'John Doe', date: '2024-07-10T10:00:00Z', isChecklistDone: true }
    ],
  },
  {
    id: 'truck-01',
    name: 'Isuzu F-Series',
    type: 'truck',
    licenseExpiry: '2025-01-20',
    nextService: '2024-11-30',
    lastService: '2024-05-25',
    lastServiceBy: 'Heavy Mech Inc.',
    damages: [],
  },
   {
    id: 'car-01',
    name: 'VW Polo',
    type: 'car_4_door',
    licenseExpiry: '2024-08-10', // Expiring soon
    nextService: '2025-05-01',
    lastService: '2024-05-01',
    lastServiceBy: 'VW Motors',
    damages: [],
  },
];


interface VehiclePart {
    id: string;
    name: string;
}

export const vehiclePartLists: Record<VehicleType, VehiclePart[]> = {
    bakkie: [
        { id: 'front-bumper', name: 'Front Bumper'},
        { id: 'windshield', name: 'Windshield'},
        { id: 'front-left-door', name: 'Front Left Door'},
        { id: 'front-right-door', name: 'Front Right Door'},
        { id: 'rear-left-door', name: 'Rear Left Door'},
        { id: 'rear-right-door', name: 'Rear Right Door'},
        { id: 'load-bin', name: 'Load Bin'},
        { id: 'rear-bumper', name: 'Rear Bumper'},
    ],
    car_4_door: [
        { id: 'front-bumper', name: 'Front Bumper'},
        { id: 'windshield', name: 'Windshield'},
        { id: 'front-left-door', name: 'Front Left Door'},
        { id: 'rear-left-door', name: 'Rear Left Door'},
        { id: 'front-right-door', name: 'Front Right Door'},
        { id: 'rear-right-door', name: 'Rear Right Door'},
        { id: 'rear-windshield', name: 'Rear Windshield'},
        { id: 'rear-bumper', name: 'Rear Bumper'},
    ],
    car_2_door: [
        { id: 'front-bumper', name: 'Front Bumper'},
        { id: 'windshield', name: 'Windshield'},
        { id: 'left-door', name: 'Left Door'},
        { id: 'right-door', name: 'Right Door'},
        { id: 'rear-windshield', name: 'Rear Windshield'},
        { id: 'rear-bumper', name: 'Rear Bumper'},
    ],
    truck: [
        { id: 'front-bumper', name: 'Front Bumper'},
        { id: 'windshield', name: 'Windshield'},
        { id: 'driver-door', name: 'Driver Door'},
        { id: 'passenger-door', name: 'Passenger Door'},
        { id: 'trailer', name: 'Trailer/Load Area'},
    ],
    bike: [], // Not implemented
}
