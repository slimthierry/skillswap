import React from "react";
import type { UserSkillOffered } from "@skillswap/types";
import { classNames, proficiencyColors, formatBalance } from "@skillswap/utils";

export interface SkillCardProps {
  skill: UserSkillOffered;
  onSelect?: (skill: UserSkillOffered) => void;
  compact?: boolean;
}

const proficiencyLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export function SkillCard({ skill, onSelect, compact = false }: SkillCardProps) {
  const levelColor =
    proficiencyColors[skill.proficiency_level] || "bg-gray-100 text-gray-700";
  const levelLabel = proficiencyLabels[skill.proficiency_level] || skill.proficiency_level;

  return (
    <div
      className={classNames(
        "rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md",
        compact ? "p-3" : "p-4",
        onSelect && "cursor-pointer"
      )}
      onClick={() => onSelect?.(skill)}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(skill);
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3
            className={classNames(
              "font-semibold text-gray-900 truncate",
              compact ? "text-sm" : "text-base"
            )}
          >
            {skill.skill?.name || "Unknown Skill"}
          </h3>
          {skill.skill?.category && !compact && (
            <p className="text-xs text-gray-500 mt-0.5">
              {skill.skill.category.name}
            </p>
          )}
        </div>
        <span
          className={classNames(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
            levelColor
          )}
        >
          {levelLabel}
        </span>
      </div>

      {skill.description && !compact && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {skill.description}
        </p>
      )}

      <div className={classNames("flex items-center gap-2", compact ? "mt-1.5" : "mt-3")}>
        <span className="inline-flex items-center text-xs font-medium text-orange-600">
          {formatBalance(skill.hourly_rate_credits)}/session
        </span>
        {!skill.is_active && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            Inactive
          </span>
        )}
      </div>
    </div>
  );
}
