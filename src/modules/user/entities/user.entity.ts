import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

export const userRolesArray = ["student", "teacher", "admin"] as const;
export type UserRole = typeof userRolesArray[number];

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "text", unique: true })
  email!: string;

  @Column({ type: "text" })
  password!: string;

  @Column({ name: "full_name", type: "text", nullable: true })
  fullName?: string;

  @Column({
    type: "enum",
    enum: userRolesArray,
    default: "student",
  })
  role!: UserRole;

  @Column({ name: "avatar_url", type: "text", nullable: true })
  avatarUrl?: string;

  @Column({ name: "refresh_token", type: "text", nullable: true })
  refreshToken!: string | null;
}
