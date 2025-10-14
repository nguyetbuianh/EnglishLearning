import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserQuestionHistory } from './user-answer.entity';
import { UserProgress } from './user-progress.entity';
import { UserVocabulary } from './user-vocabulary.entity';
import { UserGrammar } from './user-grammar.entity';
import { UserQuestion } from './user-questions.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: "mezon_user_id", length: 500, unique: true, type: 'varchar' })
  mezonUserId: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  username: string;

  @Column({ name: "joined_at", type: "timestamp" })
  joinedAt: Date;

  @OneToMany(() => UserQuestionHistory, (uq) => uq.user)
  questionHistory: UserQuestionHistory[];

  @OneToMany(() => UserProgress, (up) => up.user)
  progress: UserProgress[];

  @OneToMany(() => UserVocabulary, (uv) => uv.user)
  vocabulary: UserVocabulary[];

  @OneToMany(() => UserGrammar, (ug) => ug.user)
  grammar: UserGrammar[];

  @OneToMany(() => UserQuestion, (qa) => qa.user)
  userQuestions: UserQuestion[];
}
