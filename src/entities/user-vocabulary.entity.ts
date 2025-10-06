import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Vocabulary } from './vocabulary.entity';

@Entity('user_vocabulary')
@Unique(['user', 'vocabulary'])
export class UserVocabulary {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Vocabulary, (v) => v.userVocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  added_at: Date;
}
