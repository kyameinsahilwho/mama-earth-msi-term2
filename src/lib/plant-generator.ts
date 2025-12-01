// Simple pseudo-random number generator based on seed
class Random {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // Returns value between 0 and 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Returns integer between min and max (inclusive)
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Returns true/false based on probability
  chance(probability: number): boolean {
    return this.next() < probability;
  }
  
  pick<T>(array: T[]): T {
      return array[this.range(0, array.length - 1)];
  }
}

export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export interface PlantConfig {
  stemColor: string;
  leafColor: string;
  flowerColor: string;
  potColor: string;
  height: number;
  bushiness: number; // 0-1
}

const PALETTES = [
    { stem: "#4a7c59", leaf: "#88d498", flower: "#ff6b6b", pot: "#d4a373" }, // Classic
    { stem: "#2d6a4f", leaf: "#52b788", flower: "#ffd166", pot: "#bc6c25" }, // Forest
    { stem: "#004b23", leaf: "#008000", flower: "#ccff33", pot: "#dda15e" }, // Vibrant
    { stem: "#386641", leaf: "#6a994e", flower: "#f2e8cf", pot: "#a7c957" }, // Muted
    { stem: "#588157", leaf: "#a3b18a", flower: "#ffb703", pot: "#e63946" }, // Retro
];

const FLOWER_COLORS = [
    "#ff6b6b", "#ffd166", "#ccff33", "#f2e8cf", "#ffb703", 
    "#e63946", "#9d4edd", "#ff006e", "#3a86ff", "#8338ec",
    "#fb8500", "#023047", "#219ebc", "#ef476f", "#06d6a0"
];

export function generatePlantPixels(seed: string, stage: number): Pixel[] {
  const rng = new Random(seed);
  const pixels: Pixel[] = [];
  const gridSize = 32; // 32x32 grid
  const centerX = 16;
  const groundY = 28;

  const palette = rng.pick(PALETTES);
  const primaryFlowerColor = rng.pick(FLOWER_COLORS);
  const secondaryFlowerColor = rng.pick(FLOWER_COLORS);
  
  // --- Helper to add pixel ---
  const addPixel = (x: number, y: number, color: string) => {
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        // Simple z-index by overwriting
        pixels.push({ x: Math.floor(x), y: Math.floor(y), color });
    }
  };

  // --- Helper to draw flower ---
  const drawFlowerAt = (x: number, y: number) => {
      const color = rng.chance(0.7) ? primaryFlowerColor : secondaryFlowerColor;
      const centerColor = "#FFF9C4"; // Light yellow center
      const type = rng.range(0, 2); 
      
      if (type === 0) { // Daisy / Star Shape
          //   P
          // P C P
          //   P
          addPixel(x, y-1, color); // Top
          addPixel(x, y+1, color); // Bottom
          addPixel(x-1, y, color); // Left
          addPixel(x+1, y, color); // Right
          addPixel(x, y, centerColor); // Center
      } else if (type === 1) { // Tulip / Cup Shape
          // P . P
          // P P P
          // . S .
          addPixel(x-1, y-1, color);
          addPixel(x+1, y-1, color);
          addPixel(x-1, y, color);
          addPixel(x, y, color);
          addPixel(x+1, y, color);
          addPixel(x, y+1, palette.stem); // Base/Stem
      } else { // Rose / Bud Shape
          // . P P
          // P C P
          // . P .
          addPixel(x, y-1, color);
          addPixel(x+1, y-1, color);
          addPixel(x-1, y, color);
          addPixel(x, y, centerColor); // Center highlight
          addPixel(x+1, y, color);
          addPixel(x, y+1, color);
      }
  };

  // --- Draw Pot (Always present) ---
  const drawPot = () => {
      const potWidth = 10;
      const potHeight = 6;
      for(let y = groundY - potHeight; y <= groundY; y++) {
          for(let x = centerX - potWidth/2 + 1; x < centerX + potWidth/2 - 1; x++) {
              addPixel(x, y, palette.pot);
          }
      }
      // Pot Rim
      for(let x = centerX - potWidth/2; x < centerX + potWidth/2; x++) {
          addPixel(x, groundY - potHeight, "#8d6e63"); // Darker rim
      }
  };

  drawPot();

  if (stage === 1) {
      // Sprout
      addPixel(centerX, groundY - 7, palette.stem);
      addPixel(centerX, groundY - 8, palette.stem);
      addPixel(centerX - 1, groundY - 9, palette.leaf);
      addPixel(centerX + 1, groundY - 9, palette.leaf);
      return pixels;
  }

  // --- Procedural Growth ---
  
  // Config based on seed
  const maxHeight = rng.range(12, 22);
  
  let currentHeight = 0;
  if (stage >= 2) currentHeight = Math.floor(maxHeight * 0.4);
  if (stage >= 3) currentHeight = Math.floor(maxHeight * 0.7);
  if (stage >= 4) currentHeight = maxHeight;

  // Draw Main Stem
  for (let i = 0; i < currentHeight; i++) {
      const y = groundY - 7 - i;
      // Wiggle stem
      const wiggle = Math.floor(Math.sin(i * 0.5) * rng.range(0, 1)); 
      const x = centerX + wiggle;
      
      addPixel(x, y, palette.stem);
      
      // Thicker stem at bottom
      if (i < 5) addPixel(x+1, y, palette.stem);

      // Branches
      if (stage >= 3 && i > 3 && i % 4 === 0 && rng.chance(0.7)) {
          const dir = rng.chance(0.5) ? -1 : 1;
          const branchLen = rng.range(3, 6);
          for(let b=1; b<=branchLen; b++) {
              addPixel(x + (b*dir), y - b, palette.stem);
              
              // Leaves on branches
              if (stage >= 4 && b === branchLen) {
                  addPixel(x + (b*dir), y - b - 1, palette.leaf);
                  addPixel(x + (b*dir) + dir, y - b, palette.leaf);
                  addPixel(x + (b*dir) - dir, y - b, palette.leaf);
                  
                  // Flowers on branches (Stage 5 handled separately for massiveness)
                  if (stage === 4 && rng.chance(0.1)) {
                      addPixel(x + (b*dir), y - b - 2, primaryFlowerColor);
                  }
              }
          }
      }
  }
  
  // --- Stage 5: Massive Canopy & Flowers ---
  if (stage >= 5) {
      const topY = groundY - 7 - currentHeight;
      // Create a massive canopy
      const radius = rng.range(7, 10); // Even bigger radius
      
      // Draw a dense cluster of flowers to look like one big bloom
      for(let dy = -radius; dy <= radius; dy++) {
          for(let dx = -radius; dx <= radius; dx++) {
              // Circular shape with noise
              if (dx*dx + dy*dy <= radius*radius) {
                  const px = centerX + dx;
                  const py = topY + dy;
                  
                  // Base Leaf Layer (Dense)
                  if (rng.chance(0.8)) {
                      addPixel(px, py, palette.leaf);
                  }
                  
                  // Flower Layer (Very Dense - "Compilation of Flowers")
                  // We use a higher chance and cluster them
                  if (rng.chance(0.35)) {
                      drawFlowerAt(px, py);
                  }
              }
          }
      }
      
      // Add a "Crown" or "Topper" flower cluster
      drawFlowerAt(centerX, topY - radius);
      drawFlowerAt(centerX - 2, topY - radius + 1);
      drawFlowerAt(centerX + 2, topY - radius + 1);
  } else if (stage === 4) {
      // Just a top flower for stage 4
      const topY = groundY - 7 - currentHeight;
      drawFlowerAt(centerX, topY);
  }

  return pixels;
}
