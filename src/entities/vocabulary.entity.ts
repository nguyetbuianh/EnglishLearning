import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserVocabulary } from './user-vocabulary.entity';

@Entity('vocabulary')
export class Vocabulary {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  word: string;

  @Column({ nullable: true })
  part_of_speech: string;

  @Column()
  meaning: string;

  @Column({ nullable: true })
  example_sentence: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => UserVocabulary, (uv) => uv.vocabulary)
  userVocabulary: UserVocabulary[];
}
