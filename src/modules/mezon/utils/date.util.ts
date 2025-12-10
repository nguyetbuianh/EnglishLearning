import { User } from "../../../entities/user.entity";
import { CachedUser } from "../../../types/caches/user.cache";

export function getJoinAt(user: User | CachedUser): string {
  const joinAt = user.joinedAt;
  const formattedJoinDate = joinAt.toISOString().split('T')[0];

  return formattedJoinDate;
}