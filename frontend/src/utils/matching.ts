/**
 * Matching utilities for displaying compatibility scores.
 */

/**
 * Format a compatibility score for display.
 */
export function formatScore(score: number): string {
  if (score >= 100) {
    return score.toFixed(0);
  }
  return score.toFixed(1);
}

/**
 * Get a human-readable level label for a compatibility score.
 */
export function getScoreLevel(score: number): string {
  if (score >= 120) return "Excellent Match";
  if (score >= 80) return "Great Match";
  if (score >= 50) return "Good Match";
  if (score >= 30) return "Fair Match";
  return "Potential Match";
}

/**
 * Get a color class for a compatibility score.
 * Uses the warm orange/teal community theme.
 */
export function getScoreColor(score: number): string {
  if (score >= 120) return "text-teal-600";
  if (score >= 80) return "text-teal-500";
  if (score >= 50) return "text-orange-500";
  if (score >= 30) return "text-orange-400";
  return "text-gray-500";
}

/**
 * Get a background color class for a compatibility score bar.
 */
export function getScoreBarColor(score: number): string {
  if (score >= 120) return "bg-teal-500";
  if (score >= 80) return "bg-teal-400";
  if (score >= 50) return "bg-orange-400";
  if (score >= 30) return "bg-orange-300";
  return "bg-gray-300";
}

/**
 * Calculate the percentage for a score bar, capping at 200 as max.
 */
export function getScorePercentage(score: number, max: number = 200): number {
  return Math.min((score / max) * 100, 100);
}
