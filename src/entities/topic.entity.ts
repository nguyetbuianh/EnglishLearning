import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Vocabulary } from "./vocabulary.entity";

@Entity("topic")
export class Topic {
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

  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.topic)
  public vocabularies: Vocabulary[];
}