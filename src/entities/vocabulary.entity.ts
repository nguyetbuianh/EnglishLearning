import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserVocabulary } from './user-vocabulary.entity';

@Entity('vocabulary')
export class Vocabulary {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  word: string;

  @Column({ name: "part_of_speech", type: "varchar", length: 50, nullable: true })
  partOfSpeech: string;

  @Column({ type: 'text', nullable: true })
  meaning: string;

  @Column({ name: "example_sentence", type: "text", nullable: true })
  exampleSentence: string;

  @Column({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @OneToMany(() => UserVocabulary, (uv) => uv.vocabulary)
  userVocabulary: UserVocabulary[];
}
