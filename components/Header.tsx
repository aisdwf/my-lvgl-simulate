import React from 'react';
import { View } from '../types';
import { Settings, Thermometer, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onBack: () => void;
  title?: string;
  inspectMode: boolean; // Receive inspect mode prop to disable interactions if needed
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onBack, title, inspectMode }) => {
  const isHome = currentView === View.HOME;
  const showBack = !isHome;

  // Helper to wrap click handlers (though parent capture handles inspect, this is good practice)
  const handleNav = (cb: () => void) => {
    if (!inspectMode) cb();
  };

  return (
    // HEADER CONTAINER
    // Height: 60px
    // Background: Zinc-900 (#18181b) - Very safe dark gray
    // Border-Bottom: Zinc-700 (#3f3f46)
    <div className="h-[60px] w-full bg-zinc-900 border-b border-zinc-700 flex items-center justify-between px-4 z-40 shrink-0" data-component="Header">
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        {showBack ? (
          <button 
            onClick={() => handleNav(onBack)}
            className="flex items-center gap-2 text-zinc-300 hover:text-white active:bg-zinc-700 transition-colors bg-zinc-800 border border-zinc-600 px-4 h-[40px] rounded-sm"
            data-component="BackButton"
          >
            <ArrowLeft size={20} />
            <span className="font-medium text-lg">Back</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 pl-2" data-component="LogoArea">
            {/* Logo Placeholder - Simple gradient safe for 16-bit */}
            <div className="w-8 h-8 rounded-sm bg-cyan-700 border border-cyan-500 flex items-center justify-center">
               <span className="font-bold text-white text-sm">OS</span>
            </div>
            <span className="font-bold text-xl tracking-wide text-zinc-100">HVAC OS</span>
          </div>
        )}
        
        {/* Breadcrumb Title */}
        {!isHome && title && (
          <div className="flex items-center fade-in" data-component="PageTitle">
            <div className="h-6 w-[1px] bg-zinc-600 mx-3"></div>
            <span className="text-lg font-medium text-zinc-100">{title}</span>
          </div>
        )}
      </div>

      {/* RIGHT SECTION - MAIN BUTTONS */}
      {/* Button Height: 40px */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleNav(() => onNavigate(View.PAIRING_MENU))}
          className={`flex items-center gap-2 px-5 h-[40px] rounded-sm transition-all border ${
            currentView.toString().startsWith('PAIRING') 
              ? 'bg-cyan-700 border-cyan-500 text-white' 
              : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700'
          }`}
          data-component="NavButton:Pairing"
        >
          <Settings size={18} />
          <span className="font-medium text-sm">Pairing</span>
        </button>

        <button
          onClick={() => handleNav(() => onNavigate(View.CONTROL_ROOM_LIST))}
          className={`flex items-center gap-2 px-5 h-[40px] rounded-sm transition-all border ${
            currentView.toString().startsWith('CONTROL') 
              ? 'bg-orange-700 border-orange-500 text-white' 
              : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700'
          }`}
          data-component="NavButton:Control"
        >
          <Thermometer size={18} />
          <span className="font-medium text-sm">Control</span>
        </button>
      </div>
    </div>
  );
};