/**
 * Feature Flags Utility
 *
 * Each feature can be controlled by two env variables:
 *   NEXT_PUBLIC_FEATURE_<NAME>=true|false   → enable / disable the feature entirely
 *   NEXT_PUBLIC_FEATURE_<NAME>_DEADLINE=ISO  → auto-disable after this date/time
 *
 * Status values:
 *   "enabled"         → tile is clickable
 *   "deadline-closed" → deadline has passed (auto-disabled)
 *   "coming-soon"     → feature flag is false (not yet released)
 */

export type FeatureStatus = "enabled" | "deadline-closed" | "coming-soon";

export function getFeatureStatus(
  enabled: string | undefined,
  deadline: string | undefined
): FeatureStatus {
  if (enabled !== "true") return "coming-soon";
  if (deadline) {
    const deadlineDate = new Date(deadline);
    if (!isNaN(deadlineDate.getTime()) && new Date() > deadlineDate) {
      return "deadline-closed";
    }
  }
  return "enabled";
}

/** Format a deadline ISO string to a human-readable date, e.g. "31 Mar 2026" */
export function formatDeadline(deadline: string | undefined): string {
  if (!deadline) return "";
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
