import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { ToeicPart } from './toeic-part.entity';
import { Question } from './question.entity';

@Entity('passages')
export class Passage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ToeicPart, (part) => part.passages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: ToeicPart;

  @Column({ nullable: true })
  title: string;

  @Column()
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Question, (q) => q.passage)
  questions: Question[];
}
