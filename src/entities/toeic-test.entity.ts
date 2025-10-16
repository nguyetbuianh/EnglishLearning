import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

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
}