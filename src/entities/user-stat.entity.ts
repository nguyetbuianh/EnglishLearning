import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'user_stats' })
export class UserStats {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'total_answers', type: 'int', default: 0 })
  totalAnswers: number;

  @Column({ name: 'correct_answers', type: 'int', default: 0 })
  correctAnswers: number;

  @Column({ name: 'points', type: 'int', default: 0 })
  points: number;

  @Column({ name: 'streak_days', type: 'int', default: 0 })
  streakDays: number;

  @Column({ name: 'last_answer_date', type: 'date', nullable: true })
  lastAnswerDate: Date;

  @Column({ name: 'badges', type: 'simple-array', nullable: true })
  badges: string[];
}
