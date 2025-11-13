import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
  Unique,
  RelationId
} from 'typeorm';
import { ToeicTest } from './toeic-test.entity';
import { ToeicPart } from './toeic-part.entity';
import { QuestionOption } from './question-option.entity';
import { Passage } from './passage.entity';
import { OptionEnum } from '../enum/option.enum';

@Entity('questions')
@Unique(['test', 'part', 'questionNumber'])
export class Question {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @ManyToOne(() => ToeicTest, (test) => test.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: ToeicTest;

  @RelationId((question: Question) => question.test)
  testId: number;

  @ManyToOne(() => ToeicPart, (part) => part.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: ToeicPart;

  @RelationId((question: Question) => question.part)
  partId: number;

  @ManyToOne(() => Passage, (p) => p.questions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'passage_id' })
  passage: Passage;

  @Column({ name: 'question_number', type: 'int', nullable: true })
  questionNumber: number;

  @Column({ name: 'question_text', type: 'text', nullable: true })
  questionText: string;

  @Column({ name: 'correct_option', type: 'char', length: 1, nullable: true })
  correctOption: OptionEnum;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'audio_url', type: 'varchar', length: 255, nullable: true })
  audioUrl: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => QuestionOption, (opt) => opt.question)
  options: QuestionOption[];
}
