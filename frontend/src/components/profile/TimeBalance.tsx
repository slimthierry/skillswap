import React from "react";
import type { TimeBalance as TimeBalanceType } from "@skillswap/types";
import { classNames, formatBalance } from "@skillswap/utils";

export interface TimeBalanceProps {
  balance: TimeBalanceType;
  compact?: boolean;
}

export function TimeBalance({ balance, compact = false }: TimeBalanceProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-50 to-teal-50 border border-orange-200 px-3 py-1.5">
        <svg
          className="h-4 w-4 text-orange-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-bold text-gray-900">
          {formatBalance(balance.available)}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-orange-50 via-white to-teal-50 border border-gray-200 p-5 shadow-sm">
      {/* Main balance */}
      <div className="text-center mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">
          Available Credits
        </p>
        <div className="flex items-center justify-center gap-2">
          <svg
            className="h-8 w-8 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-4xl font-bold text-gray-900">
            {formatBalance(balance.available)}
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Total Earned</p>
          <p className="text-lg font-semibold text-teal-600">
            +{formatBalance(balance.total_earned)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Total Spent</p>
          <p className="text-lg font-semibold text-orange-600">
            -{formatBalance(balance.total_spent)}
          </p>
        </div>
      </div>

      {/* Visual bar */}
      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          {balance.total_earned > 0 && (
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-orange-400 transition-all duration-500"
              style={{
                width: `${Math.min(
                  (balance.available / balance.total_earned) * 100,
                  100
                )}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
