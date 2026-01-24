'use client';

import { useState } from 'react';
import styles from './GrainControls.module.css';

interface GrainSettings {
  opacity: number;
  baseFrequency: number;
  numOctaves: number;
  brightness: number;
  contrast: number;
  blendMode: string;
  animated: boolean;
  speed: number;
}

interface GrainControlsProps {
  onChange: (settings: GrainSettings) => void;
  settings: GrainSettings;
}

export const defaultGrainSettings: GrainSettings = {
  opacity: 0.4,
  baseFrequency: 0.85,
  numOctaves: 4,
  brightness: 1,
  contrast: 1,
  blendMode: 'overlay',
  animated: false,
  speed: 10,
};

const blendModes = [
  'normal',
  'overlay',
  'multiply',
  'screen',
  'soft-light',
  'hard-light',
  'difference',
  'exclusion',
];

export default function GrainControls({ onChange, settings }: GrainControlsProps) {
  const handleChange = (key: keyof GrainSettings, value: number | string | boolean) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className={styles.controls}>
      <div className={styles.row}>
        <label>
          Opacity: {settings.opacity.toFixed(2)}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.opacity}
            onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
          />
        </label>

        <label>
          Grain Size: {settings.baseFrequency.toFixed(2)}
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.05"
            value={settings.baseFrequency}
            onChange={(e) => handleChange('baseFrequency', parseFloat(e.target.value))}
          />
        </label>

        <label>
          Detail: {settings.numOctaves}
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={settings.numOctaves}
            onChange={(e) => handleChange('numOctaves', parseInt(e.target.value))}
          />
        </label>

        <label>
          Brightness: {settings.brightness.toFixed(2)}
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={settings.brightness}
            onChange={(e) => handleChange('brightness', parseFloat(e.target.value))}
          />
        </label>

        <label>
          Contrast: {settings.contrast.toFixed(2)}
          <input
            type="range"
            min="0"
            max="3"
            step="0.05"
            value={settings.contrast}
            onChange={(e) => handleChange('contrast', parseFloat(e.target.value))}
          />
        </label>

        <label>
          Blend Mode:
          <select
            value={settings.blendMode}
            onChange={(e) => handleChange('blendMode', e.target.value)}
          >
            {blendModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={settings.animated}
            onChange={(e) => handleChange('animated', e.target.checked)}
          />
          Animated
        </label>

        {settings.animated && (
          <label>
            Speed: {settings.speed}
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={settings.speed}
              onChange={(e) => handleChange('speed', parseInt(e.target.value))}
            />
          </label>
        )}
      </div>
    </div>
  );
}
