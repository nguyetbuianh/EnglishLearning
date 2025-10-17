import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Question } from './question.entity';

@Entity('question_options')
export class QuestionOption {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (q) => q.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: "option_label", type: 'char', length: 1, nullable: false })
  optionLabel: 'A' | 'B' | 'C' | 'D';

  @Column({ name: "option_text", type: 'text', nullable: false })
  optionText: string;
}