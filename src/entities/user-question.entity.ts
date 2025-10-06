import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Question } from './question.entity';

@Entity('user_question')
export class UserQuestionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.questionHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Question, (q) => q.userHistory)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'char', length: 1, nullable: true })
  chosen_option: 'A' | 'B' | 'C' | 'D';

  @Column({ nullable: true })
  is_correct: boolean;

  @CreateDateColumn()
  answered_at: Date;
}
