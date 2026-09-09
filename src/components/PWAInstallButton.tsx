import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 transition"
      >
        <Download className="w-4 h-4" />
        Install App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 transition"
        >
          <Download className="w-4 h-4" />
          Install on iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-stone-900">Install on iPhone / iPad</h3>
              <p className="mt-2 text-sm text-stone-600">
                1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-stone-100 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
