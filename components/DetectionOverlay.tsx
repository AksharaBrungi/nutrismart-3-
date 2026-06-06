
import React from 'react';
import { FoodItem } from '../types';

interface DetectionOverlayProps {
  items: FoodItem[];
  imageWidth: number;
  imageHeight: number;
}

const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ items, imageWidth, imageHeight }) => {
  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${imageWidth} ${imageHeight}`}
    >
      {items.map((item) => {
        const x = (item.box.xmin / 1000) * imageWidth;
        const y = (item.box.ymin / 1000) * imageHeight;
        const width = ((item.box.xmax - item.box.xmin) / 1000) * imageWidth;
        const height = ((item.box.ymax - item.box.ymin) / 1000) * imageHeight;

        return (
          <g key={item.id}>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="2"
              className="transition-all duration-300"
            />
            <rect
              x={x}
              y={y - 24}
              width={width}
              height="24"
              fill="#10b981"
              opacity="0.9"
            />
            <text
              x={x + 4}
              y={y - 8}
              fill="white"
              fontSize="12"
              fontWeight="600"
            >
              {item.name} ({(item.confidence * 100).toFixed(0)}%)
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default DetectionOverlay;
