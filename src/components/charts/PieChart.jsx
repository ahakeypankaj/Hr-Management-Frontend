import React from "react";

export default function PieChart({ data, size = 200, strokeWidth = 30 }) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = item.value / total;
          const strokeDasharray = circumference * percentage;
          const strokeDashoffset = circumference * currentAngle;
          currentAngle += percentage;

          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDasharray} ${circumference}`}
              strokeDashoffset={-strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{
                animation: `pieSlice 1s ease-out ${index * 0.2}s both`,
              }}
            />
          );
        })}
      </svg>
      {/* Center Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ top: 0, left: 0 }}
      >
        <span className="text-3xl font-bold" style={{ color: data[0]?.color }}>
          {total}
        </span>
        <span className="text-xs text-gray-500">Total</span>
      </div>
      <style>{`
        @keyframes pieSlice {
          from {
            stroke-dasharray: 0 ${circumference};
          }
        }
      `}</style>
    </div>
  );
}
