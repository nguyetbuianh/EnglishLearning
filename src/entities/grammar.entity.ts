import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from 'typeorm';
import { UserGrammar } from './user-grammar.entity';

@Entity('grammar')
export class Grammar {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  explanation: string;

  @Column({ type: 'text', nullable: true })
  example: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => UserGrammar, (ug) => ug.grammar)
  userGrammar: UserGrammar[];
}
