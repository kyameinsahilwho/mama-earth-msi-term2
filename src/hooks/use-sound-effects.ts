"use client";

import { useCallback } from 'react';

// Simple sound effect hook using HTML5 Audio
// In a real app, you'd use a library like use-sound or Howler.js
// and host the files. For this demo, we'll use some placeholder URLs or just log.

const SOUNDS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", // Pop/Click
  success: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3", // Success chime
  error: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3", // Error buzz
  spin: "https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3", // Spinning sound
  win: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3", // Win fanfare
  water: "https://assets.mixkit.co/active_storage/sfx/3008/3008-preview.mp3", // Subtle liquid drop
};

export function useSoundEffects() {
  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    try {
      const audio = new Audio(SOUNDS[type]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play failed (user interaction needed first)", e));
    } catch (error) {
      console.error("Failed to play sound", error);
    }
  }, []);

  return { playSound };
}
