// @ts-check
/**
 * spacedReview.js — Motor Puro de Revisão Espaçada & Histórico de Prática (v3.19.0)
 *
 * Calcula urgência de revisão por lição a partir de:
 * - oud_study_practice_stats_v1 (timestamp da última prática, sessões, precisão média YIN em cents)
 * - oud_study_mastery_v1 (STARTED | PRACTICING | MASTERED)
 */

export const PRACTICE_STATS_KEY = "oud_study_practice_stats_v1";
export const MASTERY_STAGE_KEY = "oud_study_mastery_v1";

export const REVIEW_INTERVAL_DAYS = Object.freeze({
  STARTED: 2,
  PRACTICING: 4,
  MASTERED: 10
});

const MS_PER_DAY = 86400000;

/**
 * @param {string} key
 * @returns {Record<string, any>}
 */
function readStorageJson(key) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return {};
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function loadPracticeStats() {
  return readStorageJson(PRACTICE_STATS_KEY);
}

export function loadMasteryMap() {
  return readStorageJson(MASTERY_STAGE_KEY);
}

/**
 * Calcula estado de revisão espaçada de uma lição específica (função pura para testes).
 * @param {string} lessonId
 * @param {Record<string, any>} statsMap
 * @param {Record<string, string>} masteryMap
 * @param {Set<string>} completedSet
 * @param {number} [nowMs]
 */
export function computeLessonReviewInfo(lessonId, statsMap, masteryMap, completedSet, nowMs = Date.now()) {
  const stat = statsMap?.[lessonId] || null;
  const isDone = Boolean(completedSet?.has?.(lessonId));
  const rawStage = masteryMap?.[lessonId];
  const stage = rawStage === "MASTERED" || rawStage === "PRACTICING" || rawStage === "STARTED"
    ? rawStage
    : (isDone ? "MASTERED" : "STARTED");

  const intervalDays = REVIEW_INTERVAL_DAYS[stage] || 4;
  const lastPracticedAt = Number(stat?.lastPracticedAt) || 0;
  const sessions = Number(stat?.sessions) || 0;
  const bestAvgCents = typeof stat?.bestAvgCents === "number" && Number.isFinite(stat.bestAvgCents)
    ? stat.bestAvgCents
    : null;
  const lastAvgCents = typeof stat?.lastAvgCents === "number" && Number.isFinite(stat.lastAvgCents)
    ? stat.lastAvgCents
    : null;

  if (!lastPracticedAt) {
    return {
      lessonId,
      stage,
      intervalDays,
      sessions,
      lastPracticedAt: 0,
      bestAvgCents,
      lastAvgCents,
      daysSince: null,
      isDue: false,
      overdueDays: 0,
      nextReviewInDays: null
    };
  }

  const daysSince = Math.max(0, (nowMs - lastPracticedAt) / MS_PER_DAY);
  const isDue = daysSince >= intervalDays;
  const overdueDays = isDue ? Math.max(0, daysSince - intervalDays) : 0;
  const nextReviewInDays = isDue ? 0 : Math.ceil(intervalDays - daysSince);

  return {
    lessonId,
    stage,
    intervalDays,
    sessions,
    lastPracticedAt,
    bestAvgCents,
    lastAvgCents,
    daysSince,
    isDue,
    overdueDays,
    nextReviewInDays
  };
}

/**
 * Retorna todas as lições vencidas para revisão espaçada, ordenadas da mais urgente para a menos urgente.
 * @param {Array<{ id: string }>} allLessons
 * @param {Record<string, any>} statsMap
 * @param {Record<string, string>} masteryMap
 * @param {Set<string>} completedSet
 * @param {number} [nowMs]
 */
export function getDueReviews(allLessons, statsMap, masteryMap, completedSet, nowMs = Date.now()) {
  if (!Array.isArray(allLessons)) return [];
  const due = [];
  for (const lesson of allLessons) {
    if (!lesson?.id) continue;
    const info = computeLessonReviewInfo(lesson.id, statsMap, masteryMap, completedSet, nowMs);
    if (info.isDue) {
      due.push({ lesson, info });
    }
  }
  due.sort((a, b) => b.info.overdueDays - a.info.overdueDays);
  return due;
}

/**
 * Formata idade relativa da última sessão prática.
 * @param {number | null} daysSince
 * @param {boolean} isEn
 */
export function formatRelativePracticeAge(daysSince, isEn) {
  if (daysSince === null || !Number.isFinite(daysSince)) return "";
  const whole = Math.floor(daysSince);
  if (whole <= 0) return isEn ? "Today" : "Hoje";
  if (whole === 1) return isEn ? "Yesterday" : "Ontem";
  return isEn ? `${whole}d ago` : `há ${whole}d`;
}
