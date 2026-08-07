import { createElement, type CSSProperties } from 'react';
import { Dumbbell, BookOpen, Code2, Wind, Footprints, Activity, Bike, Coffee, Heart, Music, Pencil, Flame, Moon, Sun, Star, Zap, Target, Trophy, type LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Dumbbell,
  BookOpen,
  Code2,
  Wind,
  Footprints,
  Activity,
  Bike,
  Coffee,
  Heart,
  Music,
  Pencil,
  Flame,
  Moon,
  Sun,
  Star,
  Zap,
  Target,
  Trophy,
};

export const ICON_OPTIONS = Object.keys(ICON_MAP);

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Activity;
}

export function renderIcon(name: string, props: { size?: number; style?: CSSProperties }) {
  const Icon = getIcon(name);
  return createElement(Icon, props);
}
