import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { ToeicPart } from './toeic-part.entity';
import { Question } from './question.entity';

@Entity('passages')
export class Passage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ToeicPart, (part) => part.passages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: ToeicPart;

  @Column({ type: "varchar", length: 225, nullable: true })
  title: string;

  @Column({ type: "text", nullable: false })
  content: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Question, (q) => q.passage)
  questions: Question[];
}
