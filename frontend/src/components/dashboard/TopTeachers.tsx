import React from "react";
import type { TopTeacher } from "@skillswap/types";
import { classNames, formatBalance } from "@skillswap/utils";

export interface TopTeachersProps {
  teachers: TopTeacher[];
  onViewProfile?: (userId: string) => void;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-400 text-white text-xs font-bold">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-300 text-white text-xs font-bold">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-600 text-white text-xs font-bold">
        3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
      {rank}
    </span>
  );
}

export function TopTeachers({ teachers, onViewProfile }: TopTeachersProps) {
  if (teachers.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        No teachers ranked yet. Complete sessions to appear here!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {teachers.map((teacher, index) => (
        <div
          key={teacher.id}
          className={classNames(
            "flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm",
            onViewProfile && "cursor-pointer"
          )}
          onClick={() => onViewProfile?.(teacher.id)}
          role={onViewProfile ? "button" : undefined}
          tabIndex={onViewProfile ? 0 : undefined}
          onKeyDown={(e) => {
            if (onViewProfile && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onViewProfile(teacher.id);
            }
          }}
        >
          {/* Rank */}
          <RankBadge rank={index + 1} />

          {/* Avatar */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {teacher.username.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {teacher.username}
              </span>
              {teacher.rating_count > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-gray-500">
                  <span className="text-yellow-500">&#9733;</span>
                  {teacher.rating_avg.toFixed(1)}
                </span>
              )}
            </div>

            {teacher.top_skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {teacher.top_skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs text-gray-500"
                  >
                    {skill}
                    {teacher.top_skills.indexOf(skill) <
                    Math.min(teacher.top_skills.length, 3) - 1
                      ? ","
                      : ""}
                  </span>
                ))}
                {teacher.top_skills.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{teacher.top_skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Hours */}
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-teal-600">
              {formatBalance(teacher.total_hours_taught)}
            </p>
            <p className="text-xs text-gray-400">taught</p>
          </div>
        </div>
      ))}
    </div>
  );
}
