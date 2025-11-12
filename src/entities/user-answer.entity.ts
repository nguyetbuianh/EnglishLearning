import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique
} from 'typeorm';
import { User } from './user.entity';
import { ToeicPart } from './toeic-part.entity';
import { ToeicTest } from './toeic-test.entity';
import { OptionEnum } from '../enum/option.enum';
import { Question } from './question.entity';

@Entity({ name: 'user_answer' })
@Unique(['question', 'user', 'toeicTest', 'toeicPart'])
export class UserAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.userAnswer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Question, (q) => q.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'enum', enum: OptionEnum, nullable: false })
  chosenOption: OptionEnum;

  @Column({ name: 'is_correct', type: 'boolean', nullable: true })
  isCorrect: boolean;

  @CreateDateColumn({ name: 'answered_at', type: 'timestamp' })
  answeredAt: Date;

  @ManyToOne(() => ToeicPart, (p) => p.userAnswers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toeic_part_id' })
  toeicPart: ToeicPart;

  @ManyToOne(() => ToeicTest, (t) => t.userAnswers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toeic_test_id' })
  toeicTest: ToeicTest;
}
