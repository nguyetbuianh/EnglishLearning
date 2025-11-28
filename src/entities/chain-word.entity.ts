import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chain-word')
export class ChainWord {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'word', type: 'varchar', length: 100 })
  word: string;

  @Column({ name: 'create_by', type: 'varchar', length: 50 })
  createBy: string

  @Column({ name: 'user_id', type: 'varchar', length: 225, nullable: false })
  mezonId: string
}
