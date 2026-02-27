/**
 * Utility for conditionally joining class names together.
 * Similar to the popular `clsx` / `classnames` packages.
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function classNames(...args: ClassValue[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg);
      if (inner) {
        classes.push(inner);
      }
    }
  }

  return classes.join(" ");
}
