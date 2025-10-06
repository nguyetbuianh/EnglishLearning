import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_questions')
export class UserQA {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.userQuestions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  question: string;

  @Column({ nullable: true })
  answer: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'answered' | 'rejected';

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'float', default: 1.0 })
  similarity_score: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true, type: 'timestamp' })
  answered_at: Date;
}
