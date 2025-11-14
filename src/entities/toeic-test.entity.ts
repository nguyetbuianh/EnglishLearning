import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Question } from './question.entity';
import { Passage } from './passage.entity';
import { UserAnswer } from './user-answer.entity';
import { UserProgress } from './progress.entity';

@Entity('toeic_tests')
export class ToeicTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Question, (q) => q.test)
  questions: Question[];

  @OneToMany(() => Passage, (p) => p.part)
  passages: Passage[];

  @OneToMany(() => UserAnswer, (ua) => ua.test)
  userAnswers: UserAnswer[];

  @OneToMany(() => UserProgress, (up) => up.test)
  userProgresses: UserProgress[];
}