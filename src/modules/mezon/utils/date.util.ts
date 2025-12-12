export function getJoinAt(joinAt: Date): string {
  const formattedJoinDate = joinAt.toISOString().split('T')[0];

  return formattedJoinDate;
}