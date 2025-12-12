import React from "react";
import { useTheme } from "../../context/ThemeContext";

export default function BarChart({ data, height = 200, showLabels = true, showValues = true }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const maxValue = Math.max(...data.map(d => d.value));
  
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  
  return (
    <div className="w-full">
      {/* Chart container */}
      <div className="flex">
        {/* Y-axis labels */}
        <div 
          className="flex flex-col justify-between text-xs pr-3 text-right" 
          style={{ height, color: textSecondary, minWidth: '35px' }}
        >
          <span>{maxValue}%</span>
          <span>{Math.round(maxValue * 0.75)}%</span>
          <span>{Math.round(maxValue * 0.5)}%</span>
          <span>{Math.round(maxValue * 0.25)}%</span>
          <span>0%</span>
        </div>
        
        {/* Bars container */}
        <div className="flex-1 relative" style={{ height }}>
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="w-full" 
                style={{ 
                  borderTop: `1px ${i === 4 ? 'solid' : 'dashed'} ${isDark ? '#334155' : '#e2e8f0'}` 
                }}
              />
            ))}
          </div>
          
          {/* Bars */}
          <div className="flex items-end justify-around h-full relative z-10 px-2">
            {data.map((item, index) => {
              const barHeightPercent = (item.value / maxValue) * 100;
              const actualHeight = (barHeightPercent / 100) * height;
              
              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center justify-end flex-1 h-full"
                  style={{ maxWidth: '80px' }}
                >
                  {/* Value label on top */}
                  {showValues && (
                    <div 
                      className="text-xs font-bold mb-1"
                      style={{ color: item.color }}
                    >
                      {item.value}%
                    </div>
                  )}
                  
                  {/* Bar */}
                  <div 
                    className="w-10 rounded-t-lg transition-all duration-500 ease-out cursor-pointer hover:opacity-80"
                    style={{ 
                      height: `${actualHeight}px`,
                      background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}cc 100%)`,
                      boxShadow: `0 0 12px ${item.color}40`
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* X-axis labels */}
      {showLabels && (
        <div className="flex mt-3" style={{ paddingLeft: '38px' }}>
          <div className="flex-1 flex justify-around px-2">
            {data.map((item, index) => (
              <div 
                key={index} 
                className="flex-1 text-center"
                style={{ maxWidth: '80px' }}
              >
                <span 
                  className="text-xs font-semibold px-2 py-1 rounded-md inline-block"
                  style={{ 
                    color: isDark ? '#f1f5f9' : item.color,
                    backgroundColor: `${item.color}20`
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
