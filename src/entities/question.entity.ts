import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany, JoinColumn, Unique } from 'typeorm';
import { ToeicTest } from './toeic-test.entity';
import { ToeicPart } from './toeic-part.entity';
import { Passage } from './passage.entity';
import { QuestionOption } from './question-option.entity';
import { UserQuestionHistory } from './user-question.entity';

@Entity('questions')
@Unique(['test', 'part', 'question_number'])
export class Question {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @ManyToOne(() => ToeicTest, (test) => test.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: ToeicTest;

  @ManyToOne(() => ToeicPart, (part) => part.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: ToeicPart;

  @ManyToOne(() => Passage, (p) => p.questions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'passage_id' })
  passage: Passage;

  @Column()
  question_number: number;

  @Column()
  question_text: string;

  @Column({ type: 'char', length: 1 })
  correct_option: 'A' | 'B' | 'C' | 'D';

  @Column({ nullable: true })
  explanation: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => QuestionOption, (opt) => opt.question)
  options: QuestionOption[];

  @OneToMany(() => UserQuestionHistory, (uq) => uq.question)
  userHistory: UserQuestionHistory[];
}
