import React, { useState } from 'react';
import { BedDouble, Flame, Sofa, Monitor, Vault, Droplets, Briefcase, BookOpen, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ItemCategory = 'bedroom' | 'kitchen' | 'living' | 'finance' | 'bathroom' | 'study';

interface VastuItem {
  id: string;
  name: string;
  category: ItemCategory;
  icon: React.ReactNode;
  bestZones: string[];
  avoidZones: string[];
  description: string;
}

const PLACEMENT_ITEMS: VastuItem[] = [
  { id: 'master-bed', name: 'Master Bed', category: 'bedroom', icon: <BedDouble className="w-5 h-5" />, bestZones: ['SW', 'S', 'W'], avoidZones: ['NE', 'SE', 'Center'], description: 'Sleep with head towards South or East for deep rest and health.' },
  { id: 'stove', name: 'Kitchen Stove', category: 'kitchen', icon: <Flame className="w-5 h-5" />, bestZones: ['SE', 'S', 'E'], avoidZones: ['NE', 'N', 'SW'], description: 'The person cooking must face East.' },
  { id: 'sofa', name: 'Living Room Sofa', category: 'living', icon: <Sofa className="w-5 h-5" />, bestZones: ['S', 'W', 'SW'], avoidZones: ['NE', 'Center'], description: 'Heavy furniture should be in the South or West, leaving North/East light.' },
  { id: 'tv', name: 'Television', category: 'living', icon: <Monitor className="w-5 h-5" />, bestZones: ['SE', 'NW', 'E'], avoidZones: ['SW', 'NE'], description: 'Avoid TV in the bedroom. Best placed in Southeast of living room.' },
  { id: 'safe', name: 'Safe / Locker', category: 'finance', icon: <Vault className="w-5 h-5" />, bestZones: ['SW', 'S'], avoidZones: ['NE', 'SE', 'NW'], description: 'Place safe in SW corner, opening towards the North (direction of Kubera).' },
  { id: 'toilet', name: 'Toilet Seat', category: 'bathroom', icon: <Droplets className="w-5 h-5" />, bestZones: ['SSW', 'WNW', 'NW'], avoidZones: ['NE', 'SW', 'Center', 'E'], description: 'Never place a toilet in the Northeast (brain of the house) or Center.' },
  { id: 'study', name: 'Study Desk', category: 'study', icon: <BookOpen className="w-5 h-5" />, bestZones: ['NE', 'E', 'N', 'W'], avoidZones: ['S', 'SW'], description: 'Face East or North while studying for concentration.' },
  { id: 'dining', name: 'Dining Table', category: 'kitchen', icon: <Utensils className="w-5 h-5" />, bestZones: ['W', 'E', 'N'], avoidZones: ['SW'], description: 'Eat facing East (for health) or West (for wealth).' }
];

const COMPASS_ZONES = [
  { name: 'N', label: 'North', angle: 0 },
  { name: 'NE', label: 'North-East', angle: 45 },
  { name: 'E', label: 'East', angle: 90 },
  { name: 'SE', label: 'South-East', angle: 135 },
  { name: 'S', label: 'South', angle: 180 },
  { name: 'SW', label: 'South-West', angle: 225 },
  { name: 'W', label: 'West', angle: 270 },
  { name: 'NW', label: 'North-West', angle: 315 },
];

export function VastuPlacementGuide() {
  const [selectedItem, setSelectedItem] = useState<VastuItem>(PLACEMENT_ITEMS[0]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100 bg-stone-50">
        <h2 className="text-xl font-semibold text-stone-800">Object Placement Guide</h2>
        <p className="text-sm text-stone-500 mt-1">Select an object to see its ideal Vastu zones.</p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left: Item Selection */}
        <div className="w-full lg:w-1/3 border-r border-stone-100 p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {PLACEMENT_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedItem.id === item.id ? 'bg-amber-50 border-amber-200 border text-amber-900 shadow-sm' : 'hover:bg-stone-50 border border-transparent text-stone-600'}`}
              >
                <div className={`p-2 rounded-lg ${selectedItem.id === item.id ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-400'}`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{item.name}</h4>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Compass Viz */}
        <div className="w-full lg:w-2/3 p-6 flex flex-col items-center justify-center bg-stone-50/50">
          <div className="mb-8 text-center max-w-md">
            <h3 className="text-2xl font-bold text-stone-800 mb-2">{selectedItem.name}</h3>
            <p className="text-stone-600 text-sm">{selectedItem.description}</p>
          </div>

          <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
            {/* Center Anchor */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-stone-200 flex items-center justify-center bg-white shadow-inner z-10">
                <div className="w-2 h-2 rounded-full bg-stone-300"></div>
              </div>
            </div>

            {/* Compass Rings */}
            <div className="absolute inset-0 rounded-full border border-stone-200"></div>
            <div className="absolute inset-4 rounded-full border border-stone-100"></div>

            <AnimatePresence mode="popLayout">
              {COMPASS_ZONES.map((zone) => {
                const isBest = selectedItem.bestZones.includes(zone.name);
                const isAvoid = selectedItem.avoidZones.includes(zone.name);
                
                let bgColor = 'bg-stone-100/50';
                let textColor = 'text-stone-400';
                let borderColor = 'border-stone-200';
                let scale = 1;
                let zIndex = 0;

                if (isBest) {
                  bgColor = 'bg-green-100';
                  textColor = 'text-green-700';
                  borderColor = 'border-green-300';
                  scale = 1.1;
                  zIndex = 20;
                } else if (isAvoid) {
                  bgColor = 'bg-red-50';
                  textColor = 'text-red-500';
                  borderColor = 'border-red-200';
                }

                // Calculate position
                const radius = 110; // offset from center
                const rad = (zone.angle - 90) * (Math.PI / 180);
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;

                return (
                  <motion.div
                    key={`${selectedItem.id}-${zone.name}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale, x, y }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`absolute top-1/2 left-1/2 -mt-6 -ml-6 w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold text-sm shadow-sm transition-colors duration-300 ${bgColor} ${textColor} ${borderColor}`}
                    style={{ zIndex }}
                  >
                    {zone.name}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-6 w-full">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500"></div>
              <span className="text-xs font-medium text-stone-600">Ideal Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500"></div>
              <span className="text-xs font-medium text-stone-600">Avoid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-stone-200 border border-stone-300"></div>
              <span className="text-xs font-medium text-stone-600">Neutral</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
