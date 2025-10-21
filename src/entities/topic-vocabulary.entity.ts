import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("topic-vocabularies")
export class TopicVocabulary {
  @PrimaryGeneratedColumn({ name: "id" })
  public id: number;

  @Column({ name: "name", type: "varchar" })
  public name: string;

  @Column({ name: "type", type: "varchar", default: "general" })
  public type: string;

  @Column({ name: "description", type: "text" })
  public description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  public createAt: Date;
}