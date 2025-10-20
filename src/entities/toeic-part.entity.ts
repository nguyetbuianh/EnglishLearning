import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  OneToMany,
} from 'typeorm';
import { Question } from './question.entity';
import { Passage } from './passage.entity';
import { UserAnswer } from './user-answer.entity';

@Entity('toeic_parts')
@Check(`"part_number" >= 1 AND "part_number" <= 7`)
export class ToeicPart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'part_number', type: 'int', nullable: false })
  partNumber: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @OneToMany(() => Question, (q) => q.part)
  questions: Question[];

  @OneToMany(() => Passage, (p) => p.part)
  passages: Passage[];

  @OneToMany(() => UserAnswer, (ua) => ua.toeicPart)
  userAnswers: UserAnswer[];
}