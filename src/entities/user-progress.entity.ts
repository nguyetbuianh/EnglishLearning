// user-progress.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { ToeicTest } from './toeic-test.entity';
import { ToeicPart } from './toeic-part.entity';
import { Question } from './question.entity';

@Entity('user_progress')
@Unique(['user', 'test', 'part'])
export class UserProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ToeicTest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: ToeicTest;

  @ManyToOne(() => ToeicPart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: ToeicPart;

  @ManyToOne(() => Question, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_question_id' })
  currentQuestion: Question;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;
}
