import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("feedbacks")
export class Feedback {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: "varchar", length: 50 })
  userId: string;

  @Column({ type: "text" })
  message: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
