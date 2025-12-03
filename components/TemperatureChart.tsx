import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { SensorData } from '../types';

interface TemperatureChartProps {
  data: SensorData[];
  targetTemp: number;
}

// Designed to mimic lv_chart (Line chart)
export const TemperatureChart: React.FC<TemperatureChartProps> = ({ data, targetTemp }) => {
  return (
    <div className="w-full h-full min-h-[100px]" data-component="ChartContainer">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          {/* Grid lines: Dark Zinc for subtle separation */}
          <CartesianGrid strokeDasharray="2 2" stroke="#3f3f46" vertical={true} />
          
          <XAxis 
            dataKey="time" 
            stroke="#a1a1aa" 
            tick={{fontSize: 10, fill: '#a1a1aa'}} 
            tickLine={false}
            axisLine={{ stroke: '#52525b' }}
          />
          <YAxis 
            domain={['dataMin - 1', 'dataMax + 1']} 
            stroke="#a1a1aa" 
            tick={{fontSize: 10, fill: '#a1a1aa'}}
            tickLine={false}
            axisLine={{ stroke: '#52525b' }}
          />
          
          <Tooltip 
             contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
             itemStyle={{ color: '#fff' }}
          />

          <Line
            type="linear" // 'linear' is easier to render on embedded than 'monotone'
            dataKey="value"
            stroke="#f97316" /* Orange-500 */
            strokeWidth={2}
            dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#fff' }}
            isAnimationActive={true}
          />
          
          {/* Target Line Simulation (Green) */}
          <Line
            type="linear"
            dataKey={() => targetTemp}
            stroke="#059669"
            strokeDasharray="4 4"
            strokeWidth={1}
            dot={false}
            activeDot={false}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};