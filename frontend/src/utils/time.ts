/**
 * Time formatting utilities for SkillSwap.
 */

/**
 * Format a duration in hours to a human-readable string.
 * Examples: 1 -> "1 hour", 1.5 -> "1h 30m", 0.5 -> "30 minutes"
 */
export function formatDuration(hours: number): string {
  if (hours <= 0) return "0 minutes";

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours === 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  if (minutes === 0) {
    return `${wholeHours} hour${wholeHours !== 1 ? "s" : ""}`;
  }

  return `${wholeHours}h ${minutes}m`;
}

/**
 * Format a session time for display.
 * Returns a string like "Mon, Jan 15 at 2:30 PM"
 */
export function formatSessionTime(isoString: string): string {
  const date = new Date(isoString);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const dayOfWeek = dayNames[date.getDay()];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${dayOfWeek}, ${month} ${day} at ${hours}:${minuteStr} ${ampm}`;
}

/**
 * Format a relative time string (e.g., "2 hours ago", "in 3 days").
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const absDiffSeconds = Math.abs(diffSeconds);

  const isFuture = diffSeconds > 0;

  if (absDiffSeconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(absDiffSeconds / 60);
  if (minutes < 60) {
    const label = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    return isFuture ? `in ${label}` : `${label} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const label = `${hours} hour${hours !== 1 ? "s" : ""}`;
    return isFuture ? `in ${label}` : `${label} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    const label = `${days} day${days !== 1 ? "s" : ""}`;
    return isFuture ? `in ${label}` : `${label} ago`;
  }

  const months = Math.floor(days / 30);
  const label = `${months} month${months !== 1 ? "s" : ""}`;
  return isFuture ? `in ${label}` : `${label} ago`;
}

/**
 * Format hours balance for display.
 * Examples: 3.0 -> "3.0h", 1.5 -> "1.5h", 0.25 -> "0.3h"
 */
export function formatBalance(hours: number): string {
  return `${hours.toFixed(1)}h`;
}
