import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId
} from 'typeorm';
import { Question } from './question.entity';
import { OptionEnum } from '../enum/option.enum';

@Entity('question_options')
export class QuestionOption {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (q) => q.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @RelationId((question: Question) => question.options)
  questionId: number;

  @Column({ name: "option_label", type: 'char', length: 1, nullable: false })
  optionLabel: OptionEnum;

  @Column({ name: "option_text", type: 'text', nullable: false })
  optionText: string;
}