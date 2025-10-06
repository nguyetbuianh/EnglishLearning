import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Grammar } from './grammar.entity';

@Entity('user_grammar')
@Unique(['user', 'grammar'])
export class UserGrammar {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.grammar, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Grammar, (g) => g.userGrammar, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grammar_id' })
  grammar: Grammar;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  saved_at: Date;
}
