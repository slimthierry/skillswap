import React from "react";
import type { SkillMapEntry } from "@skillswap/types";
import { classNames } from "@skillswap/utils";

export interface SkillMapProps {
  entries: SkillMapEntry[];
  onCategoryClick?: (category: string) => void;
}

const categoryColors: Record<string, string> = {
  Technology: "bg-blue-100 text-blue-800 border-blue-200",
  Languages: "bg-green-100 text-green-800 border-green-200",
  Music: "bg-purple-100 text-purple-800 border-purple-200",
  "Art & Design": "bg-pink-100 text-pink-800 border-pink-200",
  Cooking: "bg-orange-100 text-orange-800 border-orange-200",
  "Sports & Fitness": "bg-red-100 text-red-800 border-red-200",
  Business: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Academic: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Crafts & DIY": "bg-amber-100 text-amber-800 border-amber-200",
  Wellness: "bg-teal-100 text-teal-800 border-teal-200",
};

function getDefaultColor(): string {
  return "bg-gray-100 text-gray-800 border-gray-200";
}

export function SkillMap({ entries, onCategoryClick }: SkillMapProps) {
  // Group entries by category
  const grouped = entries.reduce<Record<string, SkillMapEntry[]>>((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push(entry);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  // Find max user count for scaling
  const maxCount = Math.max(...entries.map((e) => e.user_count), 1);

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const skills = grouped[category];
        const totalUsers = skills.reduce((sum, s) => sum + s.user_count, 0);
        const colorClass = categoryColors[category] || getDefaultColor();

        return (
          <div
            key={category}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div
              className={classNames(
                "flex items-center justify-between mb-3",
                onCategoryClick && "cursor-pointer"
              )}
              onClick={() => onCategoryClick?.(category)}
              role={onCategoryClick ? "button" : undefined}
              tabIndex={onCategoryClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (onCategoryClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onCategoryClick(category);
                }
              }}
            >
              <h3 className="text-sm font-semibold text-gray-900">{category}</h3>
              <span className="text-xs text-gray-500">
                {totalUsers} user{totalUsers !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.skill_name}
                  className={classNames(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                    colorClass
                  )}
                >
                  <span>{skill.skill_name}</span>
                  {skill.user_count > 0 && (
                    <span className="opacity-60">({skill.user_count})</span>
                  )}
                </div>
              ))}
            </div>

            {/* Distribution bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-teal-400 transition-all duration-500"
                style={{
                  width: `${(totalUsers / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        );
      })}

      {categories.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500">
          No skills registered yet. Be the first to share your skills!
        </div>
      )}
    </div>
  );
}
