import { Circle, Triangle, Square, Hexagon, Star } from "lucide-react";

export type EmotionType = "joy" | "anger" | "sadness" | "relaxed" | "anxiety";

export interface EmotionConfig {
  id: EmotionType;
  label: string;
  color: string;
  icon: any;
  shape: "circle" | "triangle" | "square" | "hexagon" | "star";
  musicPrompt: string;
}

export const EMOTIONS: EmotionConfig[] = [
  {
    id: "joy",
    label: "기쁨",
    color: "#FACC15", // Yellow-400
    icon: Circle,
    shape: "circle",
    musicPrompt: "Upbeat, happy, and bright acoustic pop music with a cheerful melody.",
  },
  {
    id: "anger",
    label: "분노",
    color: "#EF4444", // Red-500
    icon: Triangle,
    shape: "triangle",
    musicPrompt: "Intense, fast-paced, and aggressive rock music with heavy drums and distorted guitars.",
  },
  {
    id: "sadness",
    label: "슬픔",
    color: "#3B82F6", // Blue-500
    icon: Square,
    shape: "square",
    musicPrompt: "Melancholic, slow, and soft piano music with a touch of ambient strings.",
  },
  {
    id: "relaxed",
    label: "편안",
    color: "#10B981", // Green-500
    icon: Hexagon,
    shape: "hexagon",
    musicPrompt: "Calm, peaceful, and lo-fi chillhop music with nature sounds and soft pads.",
  },
  {
    id: "anxiety",
    label: "불안",
    color: "#8B5CF6", // Purple-500
    icon: Star,
    shape: "star",
    musicPrompt: "Tense, atmospheric, and slightly dissonant electronic music with a fast heartbeat-like rhythm.",
  },
];
