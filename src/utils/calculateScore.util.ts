export function calculateToeicScore(correct: number, total: number): number {
  if (total === 0) return 0;
  const rawScore = (correct / total) * 495;
  return Math.max(0, Math.round(rawScore));
}