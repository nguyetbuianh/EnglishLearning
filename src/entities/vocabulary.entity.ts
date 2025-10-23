import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Topic } from './topic.entity';

@Entity('vocabulary')
export class Vocabulary {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  word: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  pronounce: string;

  @Column({ name: "part_of_speech", type: "varchar", length: 50, nullable: true })
  partOfSpeech: string;

  @Column({ type: 'text', nullable: true })
  meaning: string;

  @Column({ name: "example_sentence", type: "text", nullable: true })
  exampleSentence: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @ManyToOne(() => Topic, (topic) => topic.vocabularies, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "topic_id" })
  topic: Topic;
}
