import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column, Unique } from 'typeorm';
import { User } from './user.entity';
import { ToeicPart } from './toeic-part.entity';
import { Question } from './question.entity';

@Entity('user_progress')
@Unique(['user', 'part'])
export class UserProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ToeicPart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: ToeicPart;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'current_question_id' })
  currentQuestion: Question;

  @CreateDateColumn()
  last_updated: Date;
}
