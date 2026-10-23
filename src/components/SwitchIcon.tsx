import React from 'react';
import { SoundPackId } from '@/types/sound';
import {
  Snowflake,
  Gem,
  Nut,
  Moon,
  Mountain,
  Disc,
  Wind,
  Coffee
} from 'lucide-react';

interface SwitchIconProps {
  id: SoundPackId;
  className?: string;
  style?: React.CSSProperties;
}

export function SwitchIcon({ id, className = 'w-3.5 h-3.5', style }: SwitchIconProps) {
  switch (id) {
    case 's1':
      return <Snowflake className={className} style={style} />;
    case 's2':
      return <Gem className={className} style={style} />;
    case 's3':
      return <Nut className={className} style={style} />;
    case 's4':
      return <Moon className={className} style={style} />;
    case 's5':
      return <Mountain className={className} style={style} />;
    case 's6':
      return <Disc className={className} style={style} />;
    case 's7':
      return <Wind className={className} style={style} />;
    case 's8':
      return <Coffee className={className} style={style} />;
    default:
      return <Gem className={className} style={style} />;
  }
}
