import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserGrammar } from './user-grammar.entity';

@Entity('grammar')
export class Grammar {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  title: string;

  @Column()
  explanation: string;

  @Column({ nullable: true })
  example: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => UserGrammar, (ug) => ug.grammar)
  userGrammar: UserGrammar[];
}
