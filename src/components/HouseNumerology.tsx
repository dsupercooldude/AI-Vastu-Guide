import React, { useState } from 'react';
import { Hash, Info, Star, Home, Briefcase, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NUMEROLOGY_DATA: Record<number, any> = {
  1: { energy: 'Independence & Innovation', planet: 'Sun', suits: 'Entrepreneurs, leaders, self-employed individuals.', vibe: 'Promotes individuality, ambition, and new beginnings. Ideal for those seeking personal growth.' },
  2: { energy: 'Harmony & Partnership', planet: 'Moon', suits: 'Couples, teachers, counselors, diplomats.', vibe: 'Fosters peace, sensitivity, and cooperation. Great for creating a warm, nurturing environment.' },
  3: { energy: 'Creativity & Expression', planet: 'Jupiter', suits: 'Artists, writers, entertainers, socialites.', vibe: 'Uplifting, optimistic, and highly social. A fun house filled with laughter and creative energy.' },
  4: { energy: 'Stability & Order', planet: 'Rahu (North Node)', suits: 'Accountants, builders, managers, established families.', vibe: 'Grounded, disciplined, and secure. Best for those building a solid foundation and long-term goals.' },
  5: { energy: 'Freedom & Adventure', planet: 'Mercury', suits: 'Travelers, sales professionals, communicators.', vibe: 'Dynamic, restless, and constantly changing. Expect unexpected adventures and an active social life.' },
  6: { energy: 'Love & Family', planet: 'Venus', suits: 'Families, healers, artists, homebodies.', vibe: 'Warm, beautiful, and deeply domestic. The ultimate family home that feels like a sanctuary.' },
  7: { energy: 'Spirituality & Solitude', planet: 'Ketu (South Node)', suits: 'Researchers, writers, spiritual seekers, scientists.', vibe: 'Quiet, introspective, and mystical. Perfect for deep thought, meditation, and inner discovery.' },
  8: { energy: 'Wealth & Power', planet: 'Saturn', suits: 'Business owners, investors, executives.', vibe: 'Focuses on material success, efficiency, and ambition. Demands hard work but brings significant financial reward.' },
  9: { energy: 'Humanitarianism & Completion', planet: 'Mars', suits: 'Activists, teachers, volunteers, global citizens.', vibe: 'Compassionate, broad-minded, and charitable. Encourages letting go of the past and embracing universal love.' }
};

export function HouseNumerology() {
  const [houseNumber, setHouseNumber] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculateNumerology = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHouseNumber(val);
    
    // Extract only numbers and alphabets
    const alphanumeric = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    if (!alphanumeric) {
      setResult(null);
      return;
    }

    // Convert letters to numbers (A=1, B=2... I=9, J=1... Pythegorean system)
    let sum = 0;
    for (let i = 0; i < alphanumeric.length; i++) {
      const char = alphanumeric[i];
      if (/[0-9]/.test(char)) {
        sum += parseInt(char);
      } else {
        const charCode = char.charCodeAt(0) - 64; // A=1
        sum += ((charCode - 1) % 9) + 1;
      }
    }

    // Reduce to single digit
    while (sum > 9) {
      sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    setResult(sum || null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-500" /> Astro-Vastu Numerology
          </h2>
          <p className="text-sm text-stone-500 mt-1">Calculate the energetic vibration of your property number.</p>
        </div>
      </div>
      
      <div className="p-6">
        <div className="max-w-xl mx-auto text-center mb-8">
          <label htmlFor="house-number" className="block text-sm font-semibold text-stone-700 mb-3">
            Enter your House or Apartment Number (e.g. 12B, 405, 7)
          </label>
          <input
            id="house-number"
            type="text"
            value={houseNumber}
            onChange={calculateNumerology}
            placeholder="e.g. 42A"
            className="w-full max-w-sm mx-auto text-center text-3xl font-bold py-4 px-6 border-2 border-stone-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all uppercase placeholder:text-stone-300 placeholder:font-normal"
          />
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-sm border border-indigo-100 text-indigo-600">
                  <span className="text-sm font-semibold uppercase tracking-wider mb-1">Root</span>
                  <span className="text-4xl font-black leading-none">{result}</span>
                </div>
                
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-1">{NUMEROLOGY_DATA[result].energy}</h3>
                    <p className="text-indigo-600 font-semibold text-sm flex items-center justify-center md:justify-start gap-1">
                      <Star className="w-4 h-4" /> Ruling Planet: {NUMEROLOGY_DATA[result].planet}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 text-stone-600 text-sm leading-relaxed">
                    <p><Sparkles className="w-4 h-4 inline-block text-amber-500 mr-2 -mt-1" />{NUMEROLOGY_DATA[result].vibe}</p>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Ideal For</h4>
                    <p className="text-stone-700 font-medium text-sm flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                      {NUMEROLOGY_DATA[result].suits}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
