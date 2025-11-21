import { Role } from "../../enum/role.enum";

export interface CachedUser {
  id: number;
  mezonUserId: string;
  username: string;
  joinedAt: Date;
  role: Role
}