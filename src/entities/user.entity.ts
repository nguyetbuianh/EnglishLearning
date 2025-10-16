import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: "mezon_user_id", length: 500, unique: true, type: 'varchar' })
  mezonUserId: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  username: string;

  @CreateDateColumn({ name: "joined_at", type: 'timestamp' })
  joinedAt: Date;
}