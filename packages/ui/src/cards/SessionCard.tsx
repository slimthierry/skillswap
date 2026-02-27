import React from "react";
import type { Session } from "@skillswap/types";
import {
  classNames,
  sessionStatusColors,
  sessionStatusDotColors,
  formatSessionTime,
  formatDuration,
} from "@skillswap/utils";

export interface SessionCardProps {
  session: Session;
  currentUserId: string;
  onAction?: (session: Session, action: "confirm" | "complete" | "cancel") => void;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function SessionCard({ session, currentUserId, onAction }: SessionCardProps) {
  const isTeacher = session.teacher_id === currentUserId;
  const otherUser = isTeacher ? session.learner : session.teacher;
  const role = isTeacher ? "Teaching" : "Learning";

  const statusColor =
    sessionStatusColors[session.status] || "bg-gray-100 text-gray-700";
  const dotColor = sessionStatusDotColors[session.status] || "bg-gray-400";

  const canConfirm = isTeacher && session.status === "pending";
  const canComplete =
    session.status === "confirmed" || session.status === "in_progress";
  const canCancel =
    session.status === "pending" || session.status === "confirmed";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={classNames("inline-block h-2.5 w-2.5 rounded-full", dotColor)}
              aria-hidden="true"
            />
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {session.skill?.name || "Skill Session"}
            </h3>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            <span className="font-medium text-teal-700">{role}</span>
            {otherUser && (
              <span>
                with <span className="font-medium">{otherUser.username}</span>
              </span>
            )}
          </div>
        </div>

        <span
          className={classNames(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
            statusColor
          )}
        >
          {statusLabels[session.status] || session.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
        <span>{formatSessionTime(session.scheduled_at)}</span>
        <span>{formatDuration(session.duration_hours)}</span>
      </div>

      {session.notes && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{session.notes}</p>
      )}

      {session.meeting_link && (
        <a
          href={session.meeting_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          Join Meeting
        </a>
      )}

      {onAction && (canConfirm || canComplete || canCancel) && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          {canConfirm && (
            <button
              onClick={() => onAction(session, "confirm")}
              className="rounded-md bg-teal-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-600 transition-colors"
            >
              Confirm
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => onAction(session, "complete")}
              className="rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors"
            >
              Complete
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onAction(session, "cancel")}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
