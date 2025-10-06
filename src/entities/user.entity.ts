import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserQuestionHistory } from './user-question.entity';
import { UserProgress } from './user-progress.entity';
import { UserVocabulary } from './user-vocabulary.entity';
import { UserGrammar } from './user-grammar.entity';
import { UserQA } from './user-qa.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  mezon_user_id: string;

  @Column({ nullable: true })
  username: string;

  @CreateDateColumn()
  joined_at: Date;

  @OneToMany(() => UserQuestionHistory, (uq) => uq.user)
  questionHistory: UserQuestionHistory[];

  @OneToMany(() => UserProgress, (up) => up.user)
  progress: UserProgress[];

  @OneToMany(() => UserVocabulary, (uv) => uv.user)
  vocabulary: UserVocabulary[];

  @OneToMany(() => UserGrammar, (ug) => ug.user)
  grammar: UserGrammar[];

  @OneToMany(() => UserQA, (qa) => qa.user)
  userQuestions: UserQA[];
}
