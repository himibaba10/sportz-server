import { MATCH_STATUS } from '../validation/matches.validation.js';

/**
 * Determine a match's status from its start and end times.
 *
 * Parses `startTime` and `endTime` as Dates and compares them against `now`.
 * Returns `null` when either time cannot be parsed as a valid Date.
 *
 * @param {Date|string|number} startTime - Match start time; a Date instance, ISO string, or timestamp.
 * @param {Date|string|number} endTime - Match end time; a Date instance, ISO string, or timestamp.
 * @param {Date} [now=new Date()] - Reference time used for the comparison.
 * @returns {('SCHEDULED'|'LIVE'|'FINISHED')|null} One of `MATCH_STATUS.SCHEDULED`, `MATCH_STATUS.LIVE`, or `MATCH_STATUS.FINISHED`, or `null` if either input cannot be parsed as a valid date.
 */
export function getMatchStatus(startTime, endTime, now = new Date()) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

/**
 * Ensure a match object's status reflects its start and end times, updating it if the computed status differs.
 *
 * Calls `updateStatus` and mutates `match.status` when the computed status based on `match.startTime` and `match.endTime`
 * differs from the current `match.status`. If the computed status is invalid, the match's status is left unchanged.
 *
 * @param {Object} match - Match object containing at least `startTime`, `endTime`, and `status` properties; `status` may be mutated.
 * @param {function(string): Promise|void} updateStatus - Callback invoked with the new status when an update is required; may return a promise.
 * @returns {string} The match's status after synchronization (unchanged if the computed status was invalid).
 */
export async function syncMatchStatus(match, updateStatus) {
  const nextStatus = getMatchStatus(match.startTime, match.endTime);
  if (!nextStatus) return match.status;

  if (match.status !== nextStatus) {
    await updateStatus(nextStatus);
    match.status = nextStatus;
  }
  return match.status;
}
