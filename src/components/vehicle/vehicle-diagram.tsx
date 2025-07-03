
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { VehicleType } from '@/lib/vehicles';

interface VehicleDiagramProps {
  vehicleType: VehicleType;
  damagedParts: string[];
  onPartClick: (partId: string, partName:string) => void;
}

const Hotspot = ({ id, name, d, onClick, isDamaged, cx, cy, r }: { id: string, name: string, d?: string, onClick: (id: string, name:string) => void, isDamaged: boolean, cx?: number, cy?:number, r?:number }) => (
    <>
        {d && <path id={id} d={d} className="fill-transparent stroke-transparent stroke-2 cursor-pointer hover:fill-primary/20 hover:stroke-primary" onClick={() => onClick(id, name)} />}
        {isDamaged && <circle cx={cx} cy={cy} r={r || 2} className="fill-red-500 stroke-white" />}
    </>
);


const BakkieDiagram = ({ onClick, damagedParts }: { onClick: (id: string, name:string) => void, damagedParts: string[] }) => (
  <svg viewBox="0 0 200 80" className="w-full h-auto">
    <path d="M10 30 L30 10 L170 10 L190 30 L190 60 L170 80 L30 80 L10 60 Z" className="fill-card-foreground/10 stroke-muted-foreground" />
    <path d="M50 10 L50 80" className="stroke-muted-foreground" strokeDasharray="2,2"/>
    <path d="M110 10 L110 80" className="stroke-muted-foreground" strokeDasharray="2,2"/>
    <rect x="50" y="10" width="60" height="70" className="fill-card-foreground/10 stroke-muted-foreground"/>
    
    {/* Hotspots */}
    <Hotspot id="front-bumper" name="Front Bumper" d="M30 10 L170 10 L175 15 L25 15 Z" cx={100} cy={13} onClick={onClick} isDamaged={damagedParts.includes('front-bumper')} />
    <Hotspot id="windshield" name="Windshield" d="M50 18 L110 18 L105 30 L55 30 Z" cx={80} cy={24} onClick={onClick} isDamaged={damagedParts.includes('windshield')} />
    <Hotspot id="front-left-door" name="Front Left Door" d="M50 32 L50 58 L35 65 L35 45 Z" cx={43} cy={50} onClick={onClick} isDamaged={damagedParts.includes('front-left-door')} />
    <Hotspot id="front-right-door" name="Front Right Door" d="M110 32 L110 58 L125 65 L125 45 Z" cx={117} cy={50} onClick={onClick} isDamaged={damagedParts.includes('front-right-door')} />
    <Hotspot id="rear-left-door" name="Rear Left Door" d="M50 60 L50 80 L30 80 L30 60 Z" cx={40} cy={70} onClick={onClick} isDamaged={damagedParts.includes('rear-left-door')} />
    <Hotspot id="rear-right-door" name="Rear Right Door" d="M110 60 L110 80 L130 80 L130 60 Z" cx={120} cy={70} onClick={onClick} isDamaged={damagedParts.includes('rear-right-door')} />
    <Hotspot id="load-bin" name="Load Bin" d="M115 10 L185 25 L185 65 L115 80 Z" cx={150} cy={45} onClick={onClick} isDamaged={damagedParts.includes('load-bin')} />
    <Hotspot id="rear-bumper" name="Rear Bumper" d="M30 80 L170 80 L175 75 L25 75 Z" cx={100} cy={77} onClick={onClick} isDamaged={damagedParts.includes('rear-bumper')} />
  </svg>
);


const Car4DoorDiagram = ({ onClick, damagedParts }: { onClick: (id: string, name:string) => void, damagedParts: string[] }) => (
    <svg viewBox="0 0 200 90" className="w-full h-auto">
        <path d="M40 10 C 20 10, 10 20, 10 45 C 10 70, 20 80, 40 80 L 160 80 C 180 80, 190 70, 190 45 C 190 20, 180 10, 160 10 Z" className="fill-card-foreground/10 stroke-muted-foreground"/>
        <path d="M40 20 L160 20 L150 40 L50 40 Z" className="fill-card-foreground/10 stroke-muted-foreground" />
        <path d="M40 70 L160 70 L150 50 L50 50 Z" className="fill-card-foreground/10 stroke-muted-foreground" />
        <path d="M95 10 L95 80" className="stroke-muted-foreground" strokeDasharray="2,2"/>
        
        <Hotspot id="front-bumper" name="Front Bumper" d="M40 10 C 20 10, 10 20, 10 45 L 20 45 C 20 25, 30 15, 40 15 L 160 15 C 170 15, 180 25, 180 45 L 190 45 C 190 20, 180 10, 160 10 Z M 40 10 L 160 10 L 160 15 L 40 15 Z" cx={100} cy={12} onClick={onClick} isDamaged={damagedParts.includes('front-bumper')} />
        <Hotspot id="windshield" name="Windshield" d="M50 20 L 150 20 L 140 38 L 60 38 Z" cx={100} cy={29} onClick={onClick} isDamaged={damagedParts.includes('windshield')} />
        <Hotspot id="front-left-door" name="Front Left Door" d="M20 45 L 50 40 L 50 50 L 20 45" cx={35} cy={43} onClick={onClick} isDamaged={damagedParts.includes('front-left-door')} />
        <Hotspot id="rear-left-door" name="Rear Left Door" d="M20 45 L 50 50 L 50 50 L 20 45" cx={35} cy={47} onClick={onClick} isDamaged={damagedParts.includes('rear-left-door')} />
        <Hotspot id="front-right-door" name="Front Right Door" d="M180 45 L 150 40 L 150 50 L 180 45" cx={165} cy={43} onClick={onClick} isDamaged={damagedParts.includes('front-right-door')} />
        <Hotspot id="rear-right-door" name="Rear Right Door" d="M180 45 L 150 50 L 150 50 L 180 45" cx={165} cy={47} onClick={onClick} isDamaged={damagedParts.includes('rear-right-door')} />
        <Hotspot id="rear-windshield" name="Rear Windshield" d="M50 70 L 150 70 L 140 52 L 60 52 Z" cx={100} cy={61} onClick={onClick} isDamaged={damagedParts.includes('rear-windshield')} />
        <Hotspot id="rear-bumper" name="Rear Bumper" d="M40 80 C 20 80, 10 70, 10 45 L 20 45 C 20 65, 30 75, 40 75 L 160 75 C 170 75, 180 65, 180 45 L 190 45 C 190 70, 180 80, 160 80 Z M 40 80 L 160 80 L 160 75 L 40 75 Z" cx={100} cy={78} onClick={onClick} isDamaged={damagedParts.includes('rear-bumper')} />
    </svg>
);

const TruckDiagram = ({ onClick, damagedParts }: { onClick: (id: string, name:string) => void, damagedParts: string[] }) => (
    <svg viewBox="0 0 200 100" className="w-full h-auto">
        {/* Cab */}
        <path d="M10 20 L40 5 L160 5 L190 20 L190 50 L160 60 L40 60 L10 50 Z" className="fill-card-foreground/10 stroke-muted-foreground"/>
        {/* Trailer */}
        <rect x="10" y="65" width="180" height="30" className="fill-card-foreground/10 stroke-muted-foreground"/>

        <Hotspot id="front-bumper" name="Front Bumper" d="M40 5 L160 5 L165 10 L35 10 Z" cx={100} cy={8} onClick={onClick} isDamaged={damagedParts.includes('front-bumper')} />
        <Hotspot id="windshield" name="Windshield" d="M45 15 L155 15 L150 25 L50 25 Z" cx={100} cy={20} onClick={onClick} isDamaged={damagedParts.includes('windshield')} />
        <Hotspot id="driver-door" name="Driver Door" d="M20 25 L 40 30 L 40 50 L 20 45 Z" cx={30} cy={38} onClick={onClick} isDamaged={damagedParts.includes('driver-door')} />
        <Hotspot id="passenger-door" name="Passenger Door" d="M180 25 L 160 30 L 160 50 L 180 45 Z" cx={170} cy={38} onClick={onClick} isDamaged={damagedParts.includes('passenger-door')} />
        <Hotspot id="trailer" name="Trailer/Load Area" d="M10 65 L 190 65 L 190 95 L 10 95 Z" cx={100} cy={80} onClick={onClick} isDamaged={damagedParts.includes('trailer')} />
    </svg>
);


const VehicleDiagram = ({ vehicleType, damagedParts, onPartClick }: VehicleDiagramProps) => {
  const renderDiagram = () => {
    switch (vehicleType) {
      case 'bakkie':
        return <BakkieDiagram onClick={onPartClick} damagedParts={damagedParts} />;
      case 'car_4_door':
         return <Car4DoorDiagram onClick={onPartClick} damagedParts={damagedParts} />;
      case 'car_2_door':
         return <Car4DoorDiagram onClick={onPartClick} damagedParts={damagedParts} />; // Using 4-door as a stand-in
      case 'truck':
         return <TruckDiagram onClick={onPartClick} damagedParts={damagedParts} />;
      case 'bike':
         return <p className="text-muted-foreground p-8 text-center">Interactive diagram for Motorbike is not available yet.</p>;
      default:
        return <p className="text-muted-foreground p-8 text-center">Select a vehicle to see the diagram.</p>;
    }
  };

  return <div className="bg-background rounded-lg p-2">{renderDiagram()}</div>;
};

export default VehicleDiagram;
