import {
  Column,
  Entity,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: "varchar", length: 50, default: "general" })
  type: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}