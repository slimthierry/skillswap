import React from "react";
import type { SessionReview } from "@skillswap/types";
import { classNames, formatRelativeTime } from "@skillswap/utils";

export interface ReviewCardProps {
  review: SessionReview;
  showReviewer?: boolean;
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < rating;
        return (
          <svg
            key={i}
            className={classNames(
              "h-4 w-4",
              filled ? "text-yellow-400" : "text-gray-200"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

export function ReviewCard({ review, showReviewer = true }: ReviewCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {showReviewer && review.reviewer && (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-300 to-teal-300 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {review.reviewer.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            {showReviewer && review.reviewer && (
              <p className="text-sm font-medium text-gray-900">
                {review.reviewer.username}
              </p>
            )}
            <StarRating rating={review.rating} />
          </div>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatRelativeTime(review.created_at)}
        </span>
      </div>

      {review.comment && (
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}
