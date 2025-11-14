import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserAnswer } from './user-answer.entity';
import { FavoriteVocabulary } from './favorite-vocabulary.entity';
import { DailyPracticeAnswer } from './daily-practice-answer.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: "mezon_user_id", length: 500, unique: true, type: 'varchar' })
  mezonUserId: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  username: string;

  @CreateDateColumn({ name: "joined_at", type: 'timestamp' })
  joinedAt: Date;

  @OneToMany(() => UserAnswer, (uq) => uq.user)
  userAnswer: UserAnswer[];

  @OneToMany(() => FavoriteVocabulary, (fav) => fav.user)
  favorites: FavoriteVocabulary[];

  @OneToMany(() => DailyPracticeAnswer, (dpa) => dpa.user)
  dailyPracticeAnswers: DailyPracticeAnswer[];
}