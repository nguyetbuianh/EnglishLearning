import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn, Unique, RelationId } from 'typeorm';
import { Topic } from './topic.entity';
import { FavoriteVocabulary } from './favorite-vocabulary.entity';
import { User } from './user.entity';
import { CachedUser } from '../types/caches/user.cache';

@Entity('vocabulary')
@Unique(['word'])
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

  @RelationId((vocabulary: Vocabulary) => vocabulary.topic)
  topicId: number;

  @OneToMany(() => FavoriteVocabulary, (fav) => fav.vocabulary)
  favorites: FavoriteVocabulary[];

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.vocab, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: true
  })
  @JoinColumn({ name: "user_id" })
  user: User | CachedUser;

  @RelationId((vocabulary: Vocabulary) => vocabulary.user)
  userId: number;
}
