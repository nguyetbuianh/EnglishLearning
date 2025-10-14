import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_questions')
export class UserQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.userQuestions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', nullable: false })
  question: string;

  @Column({ nullable: true })
  answer: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'answered' | 'rejected';

  @Column({ type: "varchar", length: 50, nullable: true })
  category: string;

  @Column({ name: "similarity_score", type: 'float', default: 1.0 })
  similarityScore: number;

  @Column({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @Column({ name: "answered_at", nullable: true, type: 'timestamp' })
  answeredAt: Date;
}
