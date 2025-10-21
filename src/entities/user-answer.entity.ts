import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { ToeicPart } from './toeic-part.entity';
import { ToeicTest } from './toeic-test.entity';
import { OptionEnum } from '../enum/option.enum';

@Entity({ name: 'user_answer' })
export class UserAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.userAnswer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ['A', 'B', 'C', 'D'], nullable: false })
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
