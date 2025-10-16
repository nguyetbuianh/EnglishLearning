import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
} from 'typeorm';

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
}