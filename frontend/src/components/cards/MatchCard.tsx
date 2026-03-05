import React from "react";
import type { SkillMatch } from "@skillswap/types";
import {
  classNames,
  formatScore,
  getScoreLevel,
  getScoreColor,
  getScoreBarColor,
  getScorePercentage,
} from "@skillswap/utils";

export interface MatchCardProps {
  match: SkillMatch;
  onViewProfile?: (userId: string) => void;
  onBookSession?: (match: SkillMatch) => void;
}

export function MatchCard({ match, onViewProfile, onBookSession }: MatchCardProps) {
  const { user, skills_they_offer_you_want, skills_you_offer_they_want, compatibility_score } = match;
  const scoreColor = getScoreColor(compatibility_score);
  const barColor = getScoreBarColor(compatibility_score);
  const scorePercent = getScorePercentage(compatibility_score);
  const isMutual =
    skills_they_offer_you_want.length > 0 && skills_you_offer_they_want.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{user.username}</h3>
            {user.rating_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="text-yellow-500">&#9733;</span>
                <span>{user.rating_avg.toFixed(1)}</span>
                <span>({user.rating_count})</span>
              </div>
            )}
          </div>
        </div>

        {isMutual && (
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 whitespace-nowrap">
            Mutual Match
          </span>
        )}
      </div>

      {/* Compatibility Score Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">{getScoreLevel(compatibility_score)}</span>
          <span className={classNames("font-semibold", scoreColor)}>
            {formatScore(compatibility_score)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={classNames("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      {/* Skills they offer that you want */}
      {skills_they_offer_you_want.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">They can teach you:</p>
          <div className="flex flex-wrap gap-1.5">
            {skills_they_offer_you_want.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700"
              >
                {s.skill?.name || "Skill"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills you offer that they want */}
      {skills_you_offer_they_want.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-500 mb-1">You can teach them:</p>
          <div className="flex flex-wrap gap-1.5">
            {skills_you_offer_they_want.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700"
              >
                {s.skill?.name || "Skill"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {user.bio && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{user.bio}</p>
      )}

      {/* Actions */}
      <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
        {onViewProfile && (
          <button
            onClick={() => onViewProfile(user.id)}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View Profile
          </button>
        )}
        {onBookSession && (
          <button
            onClick={() => onBookSession(match)}
            className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 transition-colors"
          >
            Book Session
          </button>
        )}
      </div>
    </div>
  );
}
