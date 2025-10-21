import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { ToeicPart } from './toeic-part.entity';
import { ToeicTest } from './toeic-test.entity';
import { Question } from './question.entity';

@Entity('passages')
export class Passage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ToeicTest, (test) => test.passages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: ToeicTest;

  @ManyToOne(() => ToeicPart, (part) => part.passages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: ToeicPart;

  @Column({ name: 'passage_number', type: 'int', nullable: false })
  passageNumber: number;

  @Column({ type: 'varchar', length: 225, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Question, (q) => q.passage)
  questions: Question[];
}