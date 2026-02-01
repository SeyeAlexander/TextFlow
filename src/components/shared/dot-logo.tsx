"use client";

import { motion } from "framer-motion";

interface DotLogoProps {
  className?: string;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

// 5x7 dot matrix patterns for each letter
const letterPatterns: Record<string, number[][]> = {
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  X: [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  F: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  L: [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  W: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1],
  ],
};

const sizeConfig = {
  sm: { dotSize: 1, gap: 1, letterGap: 4 },
  md: { dotSize: 1, gap: 1.5, letterGap: 6 },
  lg: { dotSize: 4, gap: 2, letterGap: 8 },
};

export function DotLogo({ className = "", animated = true, size = "md" }: DotLogoProps) {
  const text = "TEXTFLOW";
  const config = sizeConfig[size];

  // Calculate total columns for animation delay
  let totalColumns = 0;
  const letterStartColumns: number[] = [];

  for (const letter of text) {
    letterStartColumns.push(totalColumns);
    const pattern = letterPatterns[letter];
    if (pattern) {
      totalColumns += pattern[0].length;
    }
    totalColumns += 1; // Gap between letters
  }

  return (
    <div className={`flex items-center ${className}`} style={{ gap: config.letterGap }}>
      {text.split("").map((letter, letterIndex) => {
        const pattern = letterPatterns[letter];
        if (!pattern) return null;

        const startCol = letterStartColumns[letterIndex];

        return (
          <div key={letterIndex} className='flex flex-col' style={{ gap: config.gap }}>
            {pattern.map((row, rowIndex) => (
              <div key={rowIndex} className='flex' style={{ gap: config.gap }}>
                {row.map((dot, colIndex) => {
                  const globalCol = startCol + colIndex;
                  const delay = animated ? globalCol * 0.03 : 0;

                  return (
                    <motion.div
                      key={colIndex}
                      initial={
                        animated ? { opacity: 0, scale: 0 } : { opacity: dot ? 1 : 0.1, scale: 1 }
                      }
                      animate={{
                        opacity: dot ? 1 : 0.1,
                        scale: 1,
                      }}
                      transition={{
                        delay,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className={`rounded-full ${dot ? "bg-foreground" : "bg-foreground/10"}`}
                      style={{
                        width: config.dotSize,
                        height: config.dotSize,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Compact dot number component for cards
interface DotNumberProps {
  number: string;
  className?: string;
  color?: "default" | "orange" | "deep-orange";
}

const numberPatterns: Record<string, number[][]> = {
  "0": [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  "1": [
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 1],
  ],
  "2": [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  "3": [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  "4": [
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [1, 0, 1, 0],
    [1, 1, 1, 1],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
  ],
  "5": [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  "6": [
    [0, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  "7": [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  "8": [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  "9": [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 1, 1, 0],
  ],
};

export function DotNumber({ number, className = "", color = "default" }: DotNumberProps) {
  const colorClasses = {
    default: "bg-foreground",
    orange: "bg-orange",
    "deep-orange": "bg-deep-orange",
  };

  return (
    <div className={`flex ${className}`} style={{ gap: 3 }}>
      {number.split("").map((digit, digitIndex) => {
        const pattern = numberPatterns[digit];
        if (!pattern) return null;

        return (
          <div key={digitIndex} className='flex flex-col' style={{ gap: 1.5 }}>
            {pattern.map((row, rowIndex) => (
              <div key={rowIndex} className='flex' style={{ gap: 1.5 }}>
                {row.map((dot, colIndex) => (
                  <div
                    key={colIndex}
                    className={`rounded-full ${dot ? colorClasses[color] : "bg-foreground/10"}`}
                    style={{ width: 3, height: 3 }}
                  />
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
