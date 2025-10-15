import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Question } from './question.entity';

@Entity('user_answer')
export class UserQuestionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.questionHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Question, (q) => q.userHistory)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: "chosen_option", type: 'char', length: 1, nullable: true })
  chosenOption: 'A' | 'B' | 'C' | 'D';

  @Column({ name: "is_correct", type: "boolean", nullable: true })
  isCorrect: boolean;

  @Column({ name: "answered_at", type: "timestamp" })
  answeredAt: Date;
}
