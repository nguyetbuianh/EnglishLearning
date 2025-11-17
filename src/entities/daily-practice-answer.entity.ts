import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId, Unique } from "typeorm";
import { User } from "./user.entity";
import { Question } from "./question.entity";
import { OptionEnum } from "../enum/option.enum";

@Entity({ name: 'daily_practice_answer' })
@Unique(['question', 'user'])
export class DailyPracticeAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((dailyPracticeAnswer: DailyPracticeAnswer) => dailyPracticeAnswer.user)
  userId: number;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @RelationId((dailyPracticeAnswer: DailyPracticeAnswer) => dailyPracticeAnswer.question)
  questionId: number;

  @Column({ type: 'enum', enum: OptionEnum })
  chosenOption: OptionEnum;

  @Column({ name: 'is_correct', type: 'boolean', nullable: false })
  isCorrect: boolean;

  @CreateDateColumn({ name: 'answered_at' })
  answeredAt: Date;
}
