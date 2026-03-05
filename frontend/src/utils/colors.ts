/**
 * SkillSwap community theme colors.
 * Warm orange + teal palette for a welcoming, community-focused feel.
 */

export const colors = {
  // Primary: Warm Orange
  primary: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
  },

  // Secondary: Teal
  secondary: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#14B8A6",
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
  },

  // Neutrals
  neutral: {
    50: "#FAFAF9",
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
    400: "#A8A29E",
    500: "#78716C",
    600: "#57534E",
    700: "#44403C",
    800: "#292524",
    900: "#1C1917",
  },

  // Semantic colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
} as const;

/**
 * Proficiency level color mapping.
 */
export const proficiencyColors: Record<string, string> = {
  beginner: "bg-blue-100 text-blue-700",
  intermediate: "bg-green-100 text-green-700",
  advanced: "bg-purple-100 text-purple-700",
  expert: "bg-orange-100 text-orange-700",
};

/**
 * Session status color mapping.
 */
export const sessionStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

/**
 * Session status dot color mapping.
 */
export const sessionStatusDotColors: Record<string, string> = {
  pending: "bg-yellow-400",
  confirmed: "bg-blue-400",
  in_progress: "bg-teal-400",
  completed: "bg-green-400",
  cancelled: "bg-red-400",
};
