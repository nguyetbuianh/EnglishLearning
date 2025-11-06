import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'channel_id', type: 'varchar', length: 225, nullable: true, unique: true })
  channelId: string

  @Column({ name: 'channel_name', type: 'varchar', length: 225 })
  channelName: string;
}
