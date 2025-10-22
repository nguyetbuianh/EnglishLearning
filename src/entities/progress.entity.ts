import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Column,
} from 'typeorm';
import { ToeicTest } from './toeic-test.entity';
import { ToeicPart } from './toeic-part.entity';
@Entity('user_progress')
@Unique(['userMezonId', 'test', 'part'])
export class UserProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_mezon_id' })
  userMezonId: string;

  @ManyToOne(() => ToeicTest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: ToeicTest;

  @ManyToOne(() => ToeicPart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: ToeicPart;

  @Column({ name: 'current_question_number', nullable: true })
  currentQuestionNumber: number;

  @Column({ name: 'current_passage_number', nullable: true })
  currentPassageNumber: number;

  @Column({ name: 'is_completed', type: "boolean", default: false })
  isCompleted: boolean;
}