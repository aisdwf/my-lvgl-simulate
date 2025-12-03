import React from 'react';

interface ScreenFrameProps {
  children: React.ReactNode;
}

// This component enforces the 800x480 resolution
// It centers the content and adds a subtle border to simulate a screen bezel
export const ScreenFrame: React.FC<ScreenFrameProps> = ({ children }) => {
  return (
    <div className="relative group select-none">
      {/* Simulation Bezel - Industrial Dark Gray */}
      <div className="w-[820px] h-[500px] bg-[#121212] rounded-none shadow-2xl flex items-center justify-center border-[10px] border-[#222]">
        
        {/* Actual Display Area 800x480 */}
        {/* Using a pure black background foundation */}
        <div className="w-[800px] h-[480px] bg-black overflow-hidden relative text-white font-sans antialiased">
          {children}
        </div>
      </div>
      
      {/* Info tooltip */}
      <div className="absolute -bottom-8 left-0 right-0 text-center text-zinc-600 text-xs font-mono opacity-50 group-hover:opacity-100 transition-opacity">
        800x480 | RGB565 Simulation Mode
      </div>
    </div>
  );
};