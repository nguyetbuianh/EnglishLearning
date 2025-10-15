import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { ToeicTest } from './toeic-test.entity';
import { ToeicPart } from './toeic-part.entity';

@Entity('user_part_results')
export class UserPartResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => ToeicTest)
  test: ToeicTest;

  @ManyToOne(() => ToeicPart)
  part: ToeicPart;

  @Column({ type: 'int', nullable: true })
  score: number;

  @Column({ name: "taken_at", type: "timestamp" })
  takenAt: Date;
}
