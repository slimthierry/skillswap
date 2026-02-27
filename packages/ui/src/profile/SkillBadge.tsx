import React from "react";
import type { ProficiencyLevel } from "@skillswap/types";
import { classNames, proficiencyColors } from "@skillswap/utils";

export interface SkillBadgeProps {
  skillName: string;
  level: ProficiencyLevel;
  size?: "sm" | "md";
  onClick?: () => void;
}

const levelShortLabels: Record<ProficiencyLevel, string> = {
  beginner: "Beg",
  intermediate: "Int",
  advanced: "Adv",
  expert: "Exp",
};

export function SkillBadge({
  skillName,
  level,
  size = "sm",
  onClick,
}: SkillBadgeProps) {
  const colorClass = proficiencyColors[level] || "bg-gray-100 text-gray-700";
  const isSm = size === "sm";

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full font-medium",
        isSm ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        colorClass,
        onClick && "cursor-pointer hover:opacity-80 transition-opacity"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span className="truncate max-w-[120px]">{skillName}</span>
      <span className="opacity-70">{levelShortLabels[level]}</span>
    </span>
  );
}
