import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ScreenFrame } from './components/ScreenFrame';
import { Header } from './components/Header';
import { View, Room, InspectData } from './types';
import { MOCK_ROOMS, MOCK_DEVICES } from './constants';
import { TemperatureChart } from './components/TemperatureChart';
import { 
  Plus, 
  Activity, 
  Cpu, 
  Signal, 
  Power, 
  ChevronRight,
  Home,
  Fan,
  AlertCircle,
  Palette,
  ScanEye,
  X
} from 'lucide-react';

// --- UTILS FOR RGB565 ---
const rgbTo565 = (r: number, g: number, b: number): string => {
    const b5 = (b >> 3) & 0x1f;
    const g6 = (g >> 2) & 0x3f;
    const r5 = (r >> 3) & 0x1f;
    const val = (r5 << 11) | (g6 << 5) | b5;
    return `0x${val.toString(16).toUpperCase().padStart(4, '0')}`;
};

const parseColor = (colorStr: string): { hex: string, cCode: string } => {
    // This is a browser approximation. In a real scenario, we'd map Tailwind classes to exact values.
    // Here we use a canvas to compute the browser's rendered color.
    if (!colorStr) return { hex: 'N/A', cCode: '0x0000' };
    
    const div = document.createElement('div');
    div.style.color = colorStr;
    document.body.appendChild(div);
    const computed = getComputedStyle(div).color; // returns "rgb(r, g, b)" or "rgba..."
    document.body.removeChild(div);

    const rgbMatch = computed.match(/\d+/g);
    if (rgbMatch && rgbMatch.length >= 3) {
        const r = parseInt(rgbMatch[0]);
        const g = parseInt(rgbMatch[1]);
        const b = parseInt(rgbMatch[2]);
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        return { hex, cCode: rgbTo565(r, g, b) };
    }
    return { hex: computed, cCode: 'UNKNOWN' };
};

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [viewHistory, setViewHistory] = useState<View[]>([]);
  
  // Data State
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Inspector State
  const [inspectMode, setInspectMode] = useState(false);
  const [inspectData, setInspectData] = useState<InspectData | null>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);

  // Derived State
  const activeRoom = useMemo(() => 
    rooms.find(r => r.id === selectedRoomId), 
  [rooms, selectedRoomId]);

  // --- INSPECTOR LOGIC ---
  const handleGlobalClick = (e: React.MouseEvent) => {
    if (!inspectMode) return;
    
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    // Find the nearest meaningful interactive element or container
    const element = target.closest('button, div[data-component], div') as HTMLElement;
    
    if (element && appContainerRef.current) {
        const rect = element.getBoundingClientRect();
        const rootRect = appContainerRef.current.getBoundingClientRect();
        const styles = window.getComputedStyle(element);

        // Convert absolute coords to screen relative (0,0 to 800,480)
        const relX = Math.round(rect.left - rootRect.left);
        const relY = Math.round(rect.top - rootRect.top);
        
        const bgColorInfo = parseColor(styles.backgroundColor);
        const txtColorInfo = parseColor(styles.color);

        setInspectData({
            tagName: element.tagName,
            x: relX,
            y: relY,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            bgColor: bgColorInfo.hex,
            rgb565: bgColorInfo.cCode,
            textColor: txtColorInfo.hex,
            text: element.innerText?.slice(0, 20) || '',
            classes: element.className.split(' ').slice(0, 3).join('...') // abbreviated
        });
    }
  };

  // Navigation Handlers (Wrapped to respect inspect mode)
  const navigateTo = (view: View) => {
    if (inspectMode) return;
    if (view === currentView) return;
    setViewHistory(prev => [...prev, currentView]);
    setCurrentView(view);
  };

  const goBack = () => {
    if (inspectMode) return;
    if (viewHistory.length === 0) return;
    const newHistory = [...viewHistory];
    const prevView = newHistory.pop();
    setViewHistory(newHistory);
    setCurrentView(prevView || View.HOME);
    
    if (currentView === View.CONTROL_ROOM_DETAIL) {
      setSelectedRoomId(null);
    }
  };

  const handleRoomSelect = (roomId: string) => {
    if (inspectMode) return;
    setSelectedRoomId(roomId);
    navigateTo(View.CONTROL_ROOM_DETAIL);
  };

  // Actions
  const toggleValve = (roomId: string) => {
    if (inspectMode) return;
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, isValveOpen: !room.isValveOpen } : room
    ));
  };

  const updateTargetTemp = (roomId: string, newTemp: number) => {
    if (inspectMode) return;
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, targetTemp: newTemp } : room
    ));
  };

  // ---------------- VIEW RENDERERS ----------------

  const renderHome = () => (
    <div className="h-full flex gap-6 p-6 bg-zinc-950 relative" data-component="HomeView">
      <div className="flex-1 flex flex-col justify-center items-center bg-zinc-900 border border-zinc-800 rounded-sm" data-component="WelcomeCard">
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4 ring-1 ring-zinc-700">
           <Fan size={40} className="text-cyan-500 animate-[spin_8s_linear_infinite]" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">System Ready</h1>
        <p className="text-zinc-500 text-sm text-center px-8">
          Embedded Control Interface<br/>Ver 1.0.0 (RGB565)
        </p>
      </div>

      <div className="w-[280px] flex flex-col gap-4">
        <div className="bg-zinc-900 p-5 rounded-sm border border-zinc-800 shadow-sm" data-component="InfoPanel">
          <div className="flex items-center gap-2 mb-4 text-zinc-400 border-b border-zinc-700 pb-2">
            <Palette size={18} />
            <h2 className="font-semibold text-xs uppercase tracking-wider">Appearance</h2>
          </div>
          
          <div className="space-y-4 text-xs font-mono">
             <div>
              <p className="text-zinc-500 mb-2">Primary Colors (RGB565 Safe)</p>
              <div className="grid grid-cols-1 gap-2">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-zinc-900 border border-zinc-700"></div>
                        <span className="text-zinc-400">BG Main</span>
                    </div>
                    <span className="text-zinc-600">0x18181B</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-cyan-700"></div>
                        <span className="text-zinc-400">Accent 1</span>
                    </div>
                    <span className="text-cyan-700">0x0E7490</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-600"></div>
                        <span className="text-zinc-400">Accent 2</span>
                    </div>
                    <span className="text-orange-600">0xEA580C</span>
                 </div>
              </div>
            </div>
            <p className="text-zinc-600 italic mt-2">
                Turn on DEV mode to inspect specific elements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPairingMenu = () => (
    <div className="h-full p-8 flex gap-8 items-center justify-center bg-zinc-950">
      <button 
        type="button"
        onClick={() => !inspectMode && navigateTo(View.PAIRING_STATUS)}
        className="flex-1 h-64 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-sm flex flex-col items-center justify-center gap-6 transition-colors group"
        data-component="MenuButton:Status"
      >
        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-zinc-700">
          <Activity size={40} className="text-cyan-500" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-zinc-200">System Status</h3>
          <p className="text-zinc-500 mt-2 text-sm font-mono">14 ACTIVE NODES</p>
        </div>
      </button>

      <button 
        type="button"
        onClick={() => !inspectMode && navigateTo(View.PAIRING_ADD)}
        className="flex-1 h-64 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-sm flex flex-col items-center justify-center gap-6 transition-colors group"
        data-component="MenuButton:Add"
      >
        <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform border border-zinc-700">
          <Plus size={40} className="text-orange-500" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-zinc-200">Add Device</h3>
          <p className="text-zinc-500 mt-2 text-sm font-mono">PAIRING MODE</p>
        </div>
      </button>
    </div>
  );

  const renderPairingStatus = () => (
    <div className="h-full p-8 bg-zinc-950">
      <div className="grid grid-cols-2 gap-6 h-full">
        <div className="bg-zinc-900 rounded-sm p-6 flex flex-col justify-between border border-zinc-800 border-l-4 border-l-orange-600" data-component="StatCard:Rooms">
          <div className="flex items-start justify-between">
            <h3 className="text-zinc-400 font-medium text-lg uppercase tracking-wider">Rooms</h3>
            <Home className="text-orange-600" size={28} />
          </div>
          <span className="text-6xl font-bold text-zinc-100 font-mono">{rooms.length}</span>
        </div>

        <div className="bg-zinc-900 rounded-sm p-6 flex flex-col justify-between border border-zinc-800 border-l-4 border-l-cyan-600" data-component="StatCard:Sensors">
          <div className="flex items-start justify-between">
            <h3 className="text-zinc-400 font-medium text-lg uppercase tracking-wider">Sensors</h3>
            <Cpu className="text-cyan-600" size={28} />
          </div>
          <span className="text-6xl font-bold text-zinc-100 font-mono">
            {rooms.reduce((acc, r) => acc + r.sensorCount, 0)}
          </span>
        </div>

        <div className="col-span-2 bg-zinc-900 rounded-sm p-6 flex items-center justify-between border border-zinc-800" data-component="GatewayStatus">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-sm bg-emerald-900/30 border border-emerald-800 flex items-center justify-center">
                    <Signal size={24} className="text-emerald-500" />
                </div>
                <div>
                    <h4 className="text-zinc-100 font-bold text-lg">ZIGBEE GATEWAY</h4>
                    <p className="text-zinc-500 text-sm font-mono">CH: 11 | PAN_ID: 0x1A42</p>
                </div>
            </div>
            <div className="px-4 py-2 bg-zinc-950 rounded-sm border border-zinc-800 text-zinc-400 font-mono text-sm">
                ONLINE
            </div>
        </div>
      </div>
    </div>
  );

  const renderAddDevice = () => (
    <div className="h-full flex flex-col p-6 bg-zinc-950">
      <div className="bg-zinc-900 rounded-sm flex-1 overflow-hidden flex flex-col border border-zinc-800" data-component="DeviceList">
        <div className="p-4 bg-zinc-800 border-b border-zinc-700 flex justify-between items-center">
            <h3 className="text-zinc-100 font-semibold uppercase tracking-wider text-sm">Discovered Devices</h3>
            <div className="flex gap-2 items-center">
               <span className="text-xs text-zinc-500 font-mono">SCANNING</span>
               <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
            </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {MOCK_DEVICES.map(device => (
                <div key={device.id} className="flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 rounded-sm border border-zinc-800 transition-colors" data-component={`DeviceItem:${device.id}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded-sm flex items-center justify-center border border-zinc-700">
                             <Cpu size={20} className="text-zinc-400"/>
                        </div>
                        <div>
                            <p className="text-zinc-200 font-bold text-sm">{device.name}</p>
                            <p className="text-zinc-500 text-xs font-mono">{device.mac}</p>
                        </div>
                    </div>
                    <button className="bg-cyan-700 hover:bg-cyan-600 text-white px-5 py-2 rounded-sm font-bold text-xs uppercase tracking-wide transition-colors border border-cyan-600">
                        Pair
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderRoomList = () => (
    <div className="h-full p-6 bg-zinc-950">
      <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto pb-2">
        {rooms.map(room => (
            <button 
                type="button"
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-5 rounded-sm flex flex-col justify-between group transition-colors text-left"
                data-component={`RoomCard:${room.id}`}
            >
                <div className="flex justify-between items-start w-full">
                    <span className="text-lg font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors">{room.name}</span>
                    <div className={`w-3 h-3 rounded-sm ${room.isValveOpen ? 'bg-orange-500' : 'bg-zinc-700'}`}></div>
                </div>
                
                <div className="flex items-end justify-between w-full mt-6">
                    <div>
                        <p className="text-zinc-600 text-xs uppercase font-bold tracking-wider mb-1">Set</p>
                        <p className="text-xl text-zinc-400 font-mono">{room.targetTemp}°</p>
                    </div>
                    <div className="text-right">
                         <p className="text-zinc-600 text-xs uppercase font-bold tracking-wider mb-1">Act</p>
                         <p className="text-4xl font-bold text-zinc-100 font-mono">{room.currentTemp}°</p>
                    </div>
                </div>
            </button>
        ))}
      </div>
    </div>
  );

  const renderRoomDetail = () => {
    if (!activeRoom) return null;
    
    return (
      <div className="h-full flex p-6 gap-6 bg-zinc-950">
        <div className="w-[280px] flex flex-col gap-4 shrink-0">
            <div className="bg-zinc-900 rounded-sm p-6 flex flex-col items-center justify-center flex-1 border border-zinc-800" data-component="TempDisplay">
                <span className="text-zinc-500 mb-2 text-sm uppercase font-bold tracking-wider">Current Temp</span>
                <div className="text-7xl font-bold text-zinc-100 tracking-tighter font-mono">
                    {activeRoom.currentTemp}
                    <span className="text-2xl text-zinc-600 align-top ml-1">°C</span>
                </div>
            </div>

            <div className="bg-zinc-900 rounded-sm p-5 border border-zinc-800" data-component="ValveControl">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-zinc-300 font-medium">Valve State</span>
                    <Power size={20} className={activeRoom.isValveOpen ? 'text-orange-500' : 'text-zinc-700'} />
                </div>
                <button 
                    onClick={() => toggleValve(activeRoom.id)}
                    className={`w-full py-3 rounded-sm font-bold text-lg transition-colors border ${
                        activeRoom.isValveOpen 
                        ? 'bg-orange-700 hover:bg-orange-600 border-orange-600 text-white' 
                        : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-zinc-400'
                    }`}
                >
                    {activeRoom.isValveOpen ? 'OPEN' : 'CLOSED'}
                </button>
            </div>

            <div className="bg-zinc-900 rounded-sm p-5 border border-zinc-800" data-component="TargetControl">
                <div className="flex justify-between mb-3">
                     <span className="text-zinc-500 text-sm">Target</span>
                     <span className="text-white font-bold font-mono">{activeRoom.targetTemp.toFixed(1)}°C</span>
                </div>
                <input 
                    type="range" 
                    min="16" 
                    max="32" 
                    step="0.5"
                    value={activeRoom.targetTemp}
                    onChange={(e) => updateTargetTemp(activeRoom.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
            </div>
        </div>

        <div className="flex-1 bg-zinc-900 rounded-sm p-4 border border-zinc-800 flex flex-col" data-component="ChartPanel">
            <div className="flex justify-between items-center mb-4 ml-2">
                 <h3 className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Temperature Trend (1h)</h3>
                 <span className="text-xs text-zinc-600 font-mono">SENSOR: DS18B20</span>
            </div>
            <div className="flex-1 w-full min-h-0">
                <TemperatureChart data={activeRoom.history} targetTemp={activeRoom.targetTemp} />
            </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case View.HOME: return renderHome();
      case View.PAIRING_MENU: return renderPairingMenu();
      case View.PAIRING_STATUS: return renderPairingStatus();
      case View.PAIRING_ADD: return renderAddDevice();
      case View.CONTROL_ROOM_LIST: return renderRoomList();
      case View.CONTROL_ROOM_DETAIL: return renderRoomDetail();
      default: return renderHome();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <ScreenFrame>
        {/* Main App Container with Click Capture for Inspector */}
        <div 
            ref={appContainerRef}
            className={`flex flex-col h-full w-full bg-zinc-950 ${inspectMode ? 'cursor-crosshair' : 'cursor-default'}`}
            onClickCapture={handleGlobalClick}
        >
            <Header 
                currentView={currentView}
                onNavigate={navigateTo} 
                onBack={goBack}
                inspectMode={inspectMode}
                title={
                    currentView === View.CONTROL_ROOM_DETAIL ? activeRoom?.name :
                    currentView === View.PAIRING_STATUS ? 'System Status' :
                    currentView === View.PAIRING_ADD ? 'Add Device' :
                    currentView === View.CONTROL_ROOM_LIST ? 'Select Room' : undefined
                }
            />
            <div className="flex-1 overflow-hidden relative">
            {renderContent()}
            </div>

            {/* INSPECTOR OVERLAY */}
            {inspectMode && inspectData && (
                <div className="absolute inset-0 pointer-events-none z-[100]">
                    {/* Highlight Box */}
                    <div 
                        className="absolute border-2 border-green-400 bg-green-400/10 transition-all duration-100"
                        style={{
                            left: inspectData.x,
                            top: inspectData.y,
                            width: inspectData.width,
                            height: inspectData.height
                        }}
                    >
                         {/* Coordinates Label */}
                         <div className="absolute -top-6 left-0 bg-green-500 text-black text-[10px] font-mono px-1 font-bold">
                            X:{inspectData.x} Y:{inspectData.y}
                         </div>
                    </div>

                    {/* Info Panel Sidebar */}
                    <div className="absolute top-4 right-4 w-64 bg-zinc-900/95 border border-zinc-600 shadow-2xl p-4 pointer-events-auto backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-3 border-b border-zinc-700 pb-2">
                             <h4 className="text-green-400 font-bold font-mono text-sm uppercase">Inspector</h4>
                             <button onClick={() => setInspectData(null)} className="text-zinc-500 hover:text-white">
                                 <X size={14}/>
                             </button>
                        </div>
                        
                        <div className="space-y-3 font-mono text-xs text-zinc-300">
                             <div>
                                <span className="text-zinc-500 block">Element</span>
                                <span className="text-white font-bold">{inspectData.tagName}</span>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-zinc-500 block">Width</span>
                                    <span>{inspectData.width} px</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block">Height</span>
                                    <span>{inspectData.height} px</span>
                                </div>
                             </div>

                             <div>
                                <span className="text-zinc-500 block">Background (RGB565)</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-4 h-4 border border-white/20" style={{backgroundColor: inspectData.bgColor}}></div>
                                    <span className="text-cyan-400 font-bold select-all">{inspectData.rgb565}</span>
                                </div>
                                <span className="text-[10px] text-zinc-600 select-all">{inspectData.bgColor}</span>
                             </div>

                             {inspectData.text && (
                                 <div>
                                    <span className="text-zinc-500 block">Text Content</span>
                                    <span className="text-white italic">"{inspectData.text}"</span>
                                 </div>
                             )}

                             <div>
                                <span className="text-zinc-500 block">Component / Class</span>
                                <span className="text-[10px] text-zinc-400 break-all">{inspectData.classes}</span>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </ScreenFrame>

        {/* EXTERNAL TOGGLE FOR DEV MODE */}
        <div className="fixed bottom-8 right-8 z-[200]">
            <button 
                onClick={() => {
                    setInspectMode(!inspectMode);
                    setInspectData(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-xs shadow-xl transition-all border ${
                    inspectMode 
                    ? 'bg-green-500 text-black border-green-400' 
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                }`}
            >
                <ScanEye size={16} />
                {inspectMode ? 'DEV: ON' : 'DEV: OFF'}
            </button>
        </div>
    </div>
  );
};

export default App;