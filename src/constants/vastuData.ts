export interface ZoneInfo {
  id: string;
  name: string;
  shortName: string;
  sanskrit: string;
  degrees: [number, number]; // [start, end]
  centerDegree: number;
  element: 'Water' | 'Air' | 'Fire' | 'Earth' | 'Space';
  elementColor: string;
  elementBg: string;
  deity: string;
  attribute: string;
  idealRooms: string[];
  tabooRooms: string[];
  stripColor: string;
  stripMetal: string;
}

export interface PadaInfo {
  code: string;
  name: string;
  deity: string;
  zone: string;
  direction: 'East' | 'South' | 'West' | 'North';
  degrees: [number, number];
  centerDegree: number;
  status: 'Auspicious' | 'Neutral' | 'Inauspicious';
  effect: string;
  recommendedRemedy: string;
  treatmentMetal: string;
}

export const VASTU_16_ZONES: ZoneInfo[] = [
  {
    id: 'N',
    name: 'North',
    shortName: 'N',
    sanskrit: 'Uttara',
    degrees: [348.75, 11.25],
    centerDegree: 0,
    element: 'Water',
    elementColor: '#2563eb', // Blue
    elementBg: 'rgba(37, 99, 235, 0.25)',
    deity: 'Kuber',
    attribute: 'Wealth, Career, New Opportunities & Financial Flow',
    idealRooms: ['Entrance', 'Living Room', 'Safe/Locker', 'Water Fountain'],
    tabooRooms: ['Kitchen', 'Toilet', 'Heavy Storage', 'Master Bed'],
    stripColor: 'Blue',
    stripMetal: 'Aluminum / SS Strip'
  },
  {
    id: 'NNE',
    name: 'North-North-East',
    shortName: 'NNE',
    sanskrit: 'Parjanya-Shikhi',
    degrees: [11.25, 33.75],
    centerDegree: 22.5,
    element: 'Water',
    elementColor: '#0ea5e9', // Light Blue
    elementBg: 'rgba(14, 165, 233, 0.25)',
    deity: 'Dhanvantari',
    attribute: 'Health, Immunity, Healing & Vital Energy',
    idealRooms: ['Medicine Cabinet', 'Meditation Corner', 'Light Bed'],
    tabooRooms: ['Toilet', 'Dustbin', 'Kitchen', 'Heavy Clutter'],
    stripColor: 'Blue / White',
    stripMetal: 'Aluminum Strip'
  },
  {
    id: 'NE',
    name: 'North-East',
    shortName: 'NE',
    sanskrit: 'Ishanya',
    degrees: [33.75, 56.25],
    centerDegree: 45,
    element: 'Water',
    elementColor: '#06b6d4', // Cyan
    elementBg: 'rgba(6, 182, 212, 0.25)',
    deity: 'Lord Shiva',
    attribute: 'Clarity of Mind, Spiritual Connection & Cosmic Energy',
    idealRooms: ['Pooja/Mandir', 'Meditation Room', 'Open Balcony', 'Water Body'],
    tabooRooms: ['Toilet', 'Kitchen (Agni)', 'Staircase', 'Overhead Tank', 'Clutter'],
    stripColor: 'White / Blue',
    stripMetal: 'Aluminum / SS Strip'
  },
  {
    id: 'ENE',
    name: 'East-North-East',
    shortName: 'ENE',
    sanskrit: 'Parjanya',
    degrees: [56.25, 78.75],
    centerDegree: 67.5,
    element: 'Air',
    elementColor: '#10b981', // Emerald Mint
    elementBg: 'rgba(16, 185, 129, 0.25)',
    deity: 'Jayanta',
    attribute: 'Recreation, Fun, Refreshment & Joy of Life',
    idealRooms: ['Family Lounge', 'Kids Play Area', 'Entertainment', 'Plants'],
    tabooRooms: ['Toilet', 'Heavy Junk', 'Store Room'],
    stripColor: 'Green',
    stripMetal: 'Copper Strip'
  },
  {
    id: 'E',
    name: 'East',
    shortName: 'E',
    sanskrit: 'Purva',
    degrees: [78.75, 101.25],
    centerDegree: 90,
    element: 'Air',
    elementColor: '#22c55e', // Green
    elementBg: 'rgba(34, 197, 94, 0.25)',
    deity: 'Surya / Indra',
    attribute: 'Social Connectivity, Networking & Influential Associations',
    idealRooms: ['Main Entrance', 'Living Room', 'Study', 'Large Windows'],
    tabooRooms: ['Toilet', 'Heavy Storage', 'Dark Room'],
    stripColor: 'Green',
    stripMetal: 'Copper / Wooden Strip'
  },
  {
    id: 'ESE',
    name: 'East-South-East',
    shortName: 'ESE',
    sanskrit: 'Bhrisha',
    degrees: [101.25, 123.75],
    centerDegree: 112.5,
    element: 'Air',
    elementColor: '#84cc16', // Lime
    elementBg: 'rgba(132, 204, 22, 0.25)',
    deity: 'Bhrisha',
    attribute: 'Churning, Deep Thinking, Decision Making & Anxiety Release',
    idealRooms: ['Washing Machine', 'Reading Lounge', 'Consulting Desk'],
    tabooRooms: ['Master Bed (leads to arguments)', 'Mandir'],
    stripColor: 'Yellow / Cream',
    stripMetal: 'Brass Strip'
  },
  {
    id: 'SE',
    name: 'South-East',
    shortName: 'SE',
    sanskrit: 'Agneya',
    degrees: [123.75, 146.25],
    centerDegree: 135,
    element: 'Fire',
    elementColor: '#ef4444', // Red
    elementBg: 'rgba(239, 68, 68, 0.25)',
    deity: 'Agni',
    attribute: 'Cash Liquidity, Zeal, Passion, Spark & Fire Element',
    idealRooms: ['Kitchen (Stove)', 'Electrical Panel', 'Inverter/Heater'],
    tabooRooms: ['Underground Water Tank', 'Toilet (blocks cash flow)', 'Master Bed'],
    stripColor: 'Red / Orange',
    stripMetal: 'Copper Strip'
  },
  {
    id: 'SSE',
    name: 'South-South-East',
    shortName: 'SSE',
    sanskrit: 'Pusha',
    degrees: [146.25, 168.75],
    centerDegree: 157.5,
    element: 'Fire',
    elementColor: '#f97316', // Orange
    elementBg: 'rgba(249, 115, 22, 0.25)',
    deity: 'Vitatha',
    attribute: 'Strength, Power, Self-Confidence & Physical Vigor',
    idealRooms: ['Gym', 'Yoga Room', 'Bedroom for Youth', 'Warm Lighting'],
    tabooRooms: ['Water bodies', 'Blue Color Walls'],
    stripColor: 'Orange',
    stripMetal: 'Copper Strip'
  },
  {
    id: 'S',
    name: 'South',
    shortName: 'S',
    sanskrit: 'Dakshin',
    degrees: [168.75, 191.25],
    centerDegree: 180,
    element: 'Fire',
    elementColor: '#ea580c', // Dark Orange
    elementBg: 'rgba(234, 88, 12, 0.25)',
    deity: 'Yama',
    attribute: 'Fame, Brand Recognition, Social Standing & Peaceful Rest',
    idealRooms: ['Bedroom', 'Office of Chief Executive', 'Awards Display'],
    tabooRooms: ['Underground Water Tank', 'Large Mirror facing South'],
    stripColor: 'Red / Copper',
    stripMetal: 'Copper Strip'
  },
  {
    id: 'SSW',
    name: 'South-South-West',
    shortName: 'SSW',
    sanskrit: 'Gruhakshta',
    degrees: [191.25, 213.75],
    centerDegree: 202.5,
    element: 'Earth',
    elementColor: '#d97706', // Ochre/Amber
    elementBg: 'rgba(217, 119, 6, 0.25)',
    deity: 'Mriga',
    attribute: 'Expenditure, Elimination, Disposal & Waste Discarding',
    idealRooms: ['Toilet / Commode', 'Dustbin', 'Scrap Storage'],
    tabooRooms: ['Master Bedroom', 'Mandir', 'Safe/Locker', 'Main Entrance'],
    stripColor: 'Yellow',
    stripMetal: 'Brass Strip'
  },
  {
    id: 'SW',
    name: 'South-West',
    shortName: 'SW',
    sanskrit: 'Nairutya',
    degrees: [213.75, 236.25],
    centerDegree: 225,
    element: 'Earth',
    elementColor: '#ca8a04', // Gold/Earth
    elementBg: 'rgba(202, 138, 4, 0.25)',
    deity: 'Pitra',
    attribute: 'Relationships, Stability, Skill Mastery & Family Harmony',
    idealRooms: ['Master Bedroom', 'Heavy Storage', 'Head of Household Bed', 'Ancestral Photos'],
    tabooRooms: ['Toilet', 'Kitchen', 'Underground Tank', 'Cut Corner', 'Balcony'],
    stripColor: 'Yellow / Brass',
    stripMetal: 'Brass Strip'
  },
  {
    id: 'WSW',
    name: 'West-South-West',
    shortName: 'WSW',
    sanskrit: 'Sugreeva',
    degrees: [236.25, 258.75],
    centerDegree: 247.5,
    element: 'Space',
    elementColor: '#94a3b8', // Slate / Silver-Yellow
    elementBg: 'rgba(148, 163, 184, 0.25)',
    deity: 'Dauwarik',
    attribute: 'Education, Knowledge Retention, Savings & Investment Growth',
    idealRooms: ['Study Room', 'Bookshelves', 'Children Study Desk', 'Safe/Locker'],
    tabooRooms: ['Toilet (drains knowledge)', 'Kitchen'],
    stripColor: 'White / Cream',
    stripMetal: 'Stainless Steel / Brass'
  },
  {
    id: 'W',
    name: 'West',
    shortName: 'W',
    sanskrit: 'Paschim',
    degrees: [258.75, 281.25],
    centerDegree: 270,
    element: 'Space',
    elementColor: '#64748b', // Slate / Grey
    elementBg: 'rgba(100, 116, 139, 0.25)',
    deity: 'Lord Varuna',
    attribute: 'Gains, Commercial Profits, Realization of Desires & Manifestation',
    idealRooms: ['Dining Area', 'Overhead Water Tank', 'Safe', 'Study Table'],
    tabooRooms: ['Basement cut', 'Toilet (without metallic cure)'],
    stripColor: 'White / Silver',
    stripMetal: 'Stainless Steel / Iron Strip'
  },
  {
    id: 'WNW',
    name: 'West-North-West',
    shortName: 'WNW',
    sanskrit: 'Asura',
    degrees: [281.25, 303.75],
    centerDegree: 292.5,
    element: 'Space',
    elementColor: '#818cf8', // Indigo / Lavender
    elementBg: 'rgba(129, 140, 248, 0.25)',
    deity: 'Shosha',
    attribute: 'Emotional Detoxification, Depression Release & Mental Peace',
    idealRooms: ['Toilet (ideal for releasing stress)', 'Journaling Corner'],
    tabooRooms: ['Master Bed (causes melancholia)', 'Mandir'],
    stripColor: 'White',
    stripMetal: 'Stainless Steel Strip'
  },
  {
    id: 'NW',
    name: 'North-West',
    shortName: 'NW',
    sanskrit: 'Vayavya',
    degrees: [303.75, 326.25],
    centerDegree: 315,
    element: 'Air',
    elementColor: '#a855f7', // Purple/Violet
    elementBg: 'rgba(168, 85, 247, 0.25)',
    deity: 'Lord Vayu',
    attribute: 'Support Systems, Banking, Loans, Allies & Helpful People',
    idealRooms: ['Guest Bedroom', 'Finished Goods Store', 'Legal / Bank Documents'],
    tabooRooms: ['Master Bed', 'Overhead heavy clutter'],
    stripColor: 'White / Silver',
    stripMetal: 'Stainless Steel Strip'
  },
  {
    id: 'NNW',
    name: 'North-North-West',
    shortName: 'NNW',
    sanskrit: 'Bhallata',
    degrees: [326.25, 348.75],
    centerDegree: 337.5,
    element: 'Water',
    elementColor: '#3b82f6', // Cobalt Blue
    elementBg: 'rgba(59, 130, 246, 0.25)',
    deity: 'Soma',
    attribute: 'Attraction, Marital Harmony, Charm & Bodily Vitality',
    idealRooms: ['Newlywed Bedroom', 'Dressing Table', 'Mirror'],
    tabooRooms: ['Toilet', 'Fire/Stove'],
    stripColor: 'Blue',
    stripMetal: 'Aluminum Strip'
  }
];

// 32 Entrance Padas (MahaVastu Architecture)
export const VASTU_32_PADAS: PadaInfo[] = [
  // EAST (E1 - E8)
  { code: 'E1', name: 'Shikhi', deity: 'Shikhi', zone: 'NE', direction: 'East', degrees: [45, 56.25], centerDegree: 50.625, status: 'Inauspicious', effect: 'Fire hazards, financial instability, unexpected expenses', recommendedRemedy: 'Paste a 3-4 inch Copper or Green elemental tape on the door frame/threshold to block negative energy.', treatmentMetal: 'Copper Strip' },
  { code: 'E2', name: 'Parjanya', deity: 'Parjanya', zone: 'ENE', direction: 'East', degrees: [56.25, 67.5], centerDegree: 61.875, status: 'Inauspicious', effect: 'Female health issues, excessive unbudgeted expenditures', recommendedRemedy: 'Apply Green Tape or Copper Wire threshold barrier.', treatmentMetal: 'Copper Wire' },
  { code: 'E3', name: 'Jayanta', deity: 'Jayanta', zone: 'ENE', direction: 'East', degrees: [67.5, 78.75], centerDegree: 73.125, status: 'Auspicious', effect: 'Victory, enthusiasm, continuous joy and rapid business expansion', recommendedRemedy: 'Highly auspicious! Keep clean and illuminated with warm white lighting.', treatmentMetal: 'None Needed' },
  { code: 'E4', name: 'Indra', deity: 'Indra', zone: 'E', direction: 'East', degrees: [78.75, 90], centerDegree: 84.375, status: 'Auspicious', effect: 'Royal connections, high government support, societal respect & prosperity', recommendedRemedy: 'Highly auspicious! Install a brass or wooden bell at entrance.', treatmentMetal: 'None Needed' },
  { code: 'E5', name: 'Surya', deity: 'Surya', zone: 'E', direction: 'East', degrees: [90, 101.25], centerDegree: 95.625, status: 'Inauspicious', effect: 'Short temper, aggressive behavior, friction with authorities', recommendedRemedy: 'Install Copper Strip or Red Tape at the door sill to pacify fire aggression.', treatmentMetal: 'Copper Strip' },
  { code: 'E6', name: 'Satya', deity: 'Satya', zone: 'ESE', direction: 'East', degrees: [101.25, 112.5], centerDegree: 106.875, status: 'Inauspicious', effect: 'False promises, unfulfilled commitments in business contracts', recommendedRemedy: 'Neutralize with Brass strip or Yellow threshold tape.', treatmentMetal: 'Brass Strip' },
  { code: 'E7', name: 'Bhrisha', deity: 'Bhrisha', zone: 'ESE', direction: 'East', degrees: [112.5, 123.75], centerDegree: 118.125, status: 'Inauspicious', effect: 'Hopeless anger, domestic discord, legal notices', recommendedRemedy: 'Block with Brass Strip inserted 1/2 inch into flooring threshold.', treatmentMetal: 'Brass Strip' },
  { code: 'E8', name: 'Akash', deity: 'Akash', zone: 'SE', direction: 'East', degrees: [123.75, 135], centerDegree: 129.375, status: 'Inauspicious', effect: 'Financial theft, sudden burglary, financial losses', recommendedRemedy: 'Seal threshold with Copper wire/strip and hang Copper Swastik on the door.', treatmentMetal: 'Copper Strip' },

  // SOUTH (S1 - S8)
  { code: 'S1', name: 'Anil', deity: 'Anil', zone: 'SE', direction: 'South', degrees: [135, 146.25], centerDegree: 140.625, status: 'Inauspicious', effect: 'Adverse impact on progeny, lack of consistency in earnings', recommendedRemedy: 'Apply Red tape or Copper strip along the threshold.', treatmentMetal: 'Copper Strip' },
  { code: 'S2', name: 'Pusha', deity: 'Pusha', zone: 'SSE', direction: 'South', degrees: [146.25, 157.5], centerDegree: 151.875, status: 'Inauspicious', effect: 'Compulsion to work under strict subordination without independence', recommendedRemedy: 'Neutralize with Copper strip inserted in door sill.', treatmentMetal: 'Copper Strip' },
  { code: 'S3', name: 'Vitatha', deity: 'Vitatha', zone: 'SSE', direction: 'South', degrees: [157.5, 168.75], centerDegree: 163.125, status: 'Inauspicious', effect: 'Unfair means, social defame, fear of legal penalties', recommendedRemedy: 'Seal entrance with Brass strip and Yellow tape.', treatmentMetal: 'Brass Strip' },
  { code: 'S4', name: 'Gruhakshta', deity: 'Gruhakshta', zone: 'S', direction: 'South', degrees: [168.75, 180], centerDegree: 174.375, status: 'Auspicious', effect: 'Fame, prosperity, virtuous male progeny, powerful social standing', recommendedRemedy: 'Auspicious South entrance! Keep well lit and clutter free.', treatmentMetal: 'None Needed' },
  { code: 'S5', name: 'Yama', deity: 'Yama', zone: 'S', direction: 'South', degrees: [180, 191.25], centerDegree: 185.625, status: 'Inauspicious', effect: 'Severe debt accumulation, fear of untimely demise or legal trouble', recommendedRemedy: 'Crucial: Cut door energy using Brass wire or Brass metal strip embedded in marble/tiles.', treatmentMetal: 'Brass Strip' },
  { code: 'S6', name: 'Gandharva', deity: 'Gandharva', zone: 'SSW', direction: 'South', degrees: [191.25, 202.5], centerDegree: 196.875, status: 'Inauspicious', effect: 'Poverty, ungrateful companions, waste of resources', recommendedRemedy: 'Install Brass strip and place Rock Salt in a bronze bowl nearby.', treatmentMetal: 'Brass Strip' },
  { code: 'S7', name: 'Bhrigraj', deity: 'Bhrigraj', zone: 'SSW', direction: 'South', degrees: [202.5, 213.75], centerDegree: 208.125, status: 'Inauspicious', effect: 'Extreme laziness, unfulfilled expectations, depletion of wealth', recommendedRemedy: 'Use Brass strip threshold barrier to block draining energy.', treatmentMetal: 'Brass Strip' },
  { code: 'S8', name: 'Mriga', deity: 'Mriga', zone: 'SW', direction: 'South', degrees: [213.75, 225], centerDegree: 219.375, status: 'Inauspicious', effect: 'Loss of bodily vitality, weakness, discord between father and son', recommendedRemedy: 'Block completely with Brass metal strip and Lead/Brass pyramid.', treatmentMetal: 'Brass Strip & Lead' },

  // WEST (W1 - W8)
  { code: 'W1', name: 'Pitra', deity: 'Pitra', zone: 'SW', direction: 'West', degrees: [225, 236.25], centerDegree: 230.625, status: 'Inauspicious', effect: 'Instability in life, loss of family heritage, poverty', recommendedRemedy: 'Embed Brass strip or Lead wire across the entrance threshold.', treatmentMetal: 'Lead / Brass Strip' },
  { code: 'W2', name: 'Dauwarik', deity: 'Dauwarik', zone: 'WSW', direction: 'West', degrees: [236.25, 247.5], centerDegree: 241.875, status: 'Inauspicious', effect: 'Unstable relationships, untrustworthy employees and deceit', recommendedRemedy: 'Apply Stainless Steel strip or White adhesive tape across sill.', treatmentMetal: 'SS Strip' },
  { code: 'W3', name: 'Sugreev', deity: 'Sugreev', zone: 'WSW', direction: 'West', degrees: [247.5, 258.75], centerDegree: 253.125, status: 'Auspicious', effect: 'Immense wealth, great business profits, intellectual prowess', recommendedRemedy: 'Auspicious West entrance! Keep bright and balanced with silver/white accents.', treatmentMetal: 'None Needed' },
  { code: 'W4', name: 'Pushpdant', deity: 'Pushpdant', zone: 'W', direction: 'West', degrees: [258.75, 270], centerDegree: 264.375, status: 'Auspicious', effect: 'Gain of luxury vehicles, flourishing trade, steady bank growth', recommendedRemedy: 'Highly auspicious! Keep the door polished and clean.', treatmentMetal: 'None Needed' },
  { code: 'W5', name: 'Varun', deity: 'Varun', zone: 'W', direction: 'West', degrees: [270, 281.25], centerDegree: 275.625, status: 'Inauspicious', effect: 'Over-ambition leading to financial overstretch and heavy liabilities', recommendedRemedy: 'Fix Stainless Steel strip or White line at the threshold.', treatmentMetal: 'SS Strip' },
  { code: 'W6', name: 'Asur', deity: 'Asur', zone: 'WNW', direction: 'West', degrees: [281.25, 292.5], centerDegree: 286.875, status: 'Inauspicious', effect: 'Chronic depression, lack of motivation, daily mental agony', recommendedRemedy: 'Install Stainless Steel strip or White strip along the threshold.', treatmentMetal: 'SS Strip' },
  { code: 'W7', name: 'Shosh', deity: 'Shosh', zone: 'WNW', direction: 'West', degrees: [292.5, 303.75], centerDegree: 298.125, status: 'Inauspicious', effect: 'Drying up of resources, addiction habits, lung/chest issues', recommendedRemedy: 'Seal with Stainless Steel wire or White tape.', treatmentMetal: 'SS Wire' },
  { code: 'W8', name: 'Papyakshma', deity: 'Papyakshma', zone: 'NW', direction: 'West', degrees: [303.75, 315], centerDegree: 309.375, status: 'Inauspicious', effect: 'Cheating by outsiders, chronic illnesses, legal allegations', recommendedRemedy: 'Apply SS strip or Aluminum strip along door threshold.', treatmentMetal: 'SS Strip' },

  // NORTH (N1 - N8)
  { code: 'N1', name: 'Rog', deity: 'Rog', zone: 'NW', direction: 'North', degrees: [315, 326.25], centerDegree: 320.625, status: 'Inauspicious', effect: 'Diseases, hospital bills, feeling of being unsupported', recommendedRemedy: 'Install Aluminum or Blue elemental strip at the entrance door.', treatmentMetal: 'Aluminum Strip' },
  { code: 'N2', name: 'Nag', deity: 'Nag', zone: 'NNW', direction: 'North', degrees: [326.25, 337.5], centerDegree: 331.875, status: 'Inauspicious', effect: 'Enmity, envy from relatives, lack of loyalty in staff', recommendedRemedy: 'Seal threshold with Aluminum strip and Blue tape.', treatmentMetal: 'Aluminum Strip' },
  { code: 'N3', name: 'Mukhya', deity: 'Mukhya', zone: 'NNW', direction: 'North', degrees: [337.5, 348.75], centerDegree: 343.125, status: 'Auspicious', effect: 'Abundance of wealth, fame, spiritual blessings and chief prosperity', recommendedRemedy: 'Supreme North entrance! Decorate with brass or copper water urn (Mangal Kalash).', treatmentMetal: 'None Needed' },
  { code: 'N4', name: 'Bhallat', deity: 'Bhallat', zone: 'N', direction: 'North', degrees: [348.75, 0], centerDegree: 354.375, status: 'Auspicious', effect: 'Tremendous wealth influx, multiple properties, massive inheritance', recommendedRemedy: 'Top-tier North entrance! Keep the foyer grand and illuminated.', treatmentMetal: 'None Needed' },
  { code: 'N5', name: 'Soma', deity: 'Soma', zone: 'N', direction: 'North', degrees: [0, 11.25], centerDegree: 5.625, status: 'Auspicious', effect: 'Spiritual upliftment, peace of mind, pure thoughts, Kuber blessing', recommendedRemedy: 'Highly auspicious! Keep clean and place a green indoor plant near entrance.', treatmentMetal: 'None Needed' },
  { code: 'N6', name: 'Bhujang', deity: 'Bhujang', zone: 'NNE', direction: 'North', degrees: [11.25, 22.5], centerDegree: 16.875, status: 'Inauspicious', effect: 'Misunderstandings among siblings, stubborn behavior', recommendedRemedy: 'Install Aluminum strip or Blue tape across door sill.', treatmentMetal: 'Aluminum Strip' },
  { code: 'N7', name: 'Aditi', deity: 'Aditi', zone: 'NNE', direction: 'North', degrees: [22.5, 33.75], centerDegree: 28.125, status: 'Inauspicious', effect: 'Health troubles for women of the house, restlessness', recommendedRemedy: 'Neutralize with Aluminum strip and Blue color tape.', treatmentMetal: 'Aluminum Strip' },
  { code: 'N8', name: 'Diti', deity: 'Diti', zone: 'NE', direction: 'North', degrees: [33.75, 45], centerDegree: 39.375, status: 'Inauspicious', effect: 'Low mindset, poverty, spiritual disconnect', recommendedRemedy: 'Block entrance energy with Aluminum strip embedded in floor.', treatmentMetal: 'Aluminum Strip' }
];

export const FIVE_ELEMENTS = [
  { name: 'Water', zones: ['N', 'NNE', 'NE', 'NNW'], color: '#2563eb', bg: 'bg-blue-100 text-blue-800 border-blue-300', symbol: '🌊' },
  { name: 'Air / Wood', zones: ['ENE', 'E', 'ESE', 'NW'], color: '#16a34a', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', symbol: '🍃' },
  { name: 'Fire', zones: ['SE', 'SSE', 'S'], color: '#dc2626', bg: 'bg-red-100 text-red-800 border-red-300', symbol: '🔥' },
  { name: 'Earth', zones: ['SSW', 'SW'], color: '#d97706', bg: 'bg-amber-100 text-amber-800 border-amber-300', symbol: '⛰️' },
  { name: 'Space', zones: ['WSW', 'W', 'WNW'], color: '#64748b', bg: 'bg-slate-100 text-slate-800 border-slate-300', symbol: '🌌' }
];
