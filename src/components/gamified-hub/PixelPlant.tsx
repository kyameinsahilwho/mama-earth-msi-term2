"use client";

import React, { useMemo } from "react";
import { generatePlantPixels, Pixel } from "@/lib/plant-generator";

interface PixelPlantProps {
  seed: string;
  stage: number;
  scale?: number;
  className?: string;
}

export default function PixelPlant({ seed, stage, scale = 4, className }: PixelPlantProps) {
  const pixels = useMemo(() => generatePlantPixels(seed, stage), [seed, stage]);
  
  const gridSize = 32;
  const size = gridSize * scale;

  return (
    <div 
        className={className} 
        style={{ 
            width: size, 
            height: size, 
            imageRendering: "pixelated" 
        }}
    >
      <svg 
        viewBox={`0 0 ${gridSize} ${gridSize}`} 
        width="100%" 
        height="100%" 
        shapeRendering="crispEdges"
      >
        {pixels.map((p, i) => (
          <rect
            key={i}
            x={p.x}
            y={p.y}
            width="1"
            height="1"
            fill={p.color}
          />
        ))}
      </svg>
    </div>
  );
}
