import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Question } from './question.entity';
import { Passage } from './passage.entity';

@Entity('toeic_parts')
export class ToeicPart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  part_number: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Question, (q) => q.part)
  questions: Question[];

  @OneToMany(() => Passage, (p) => p.part)
  passages: Passage[];
}
