import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from "typeorm";
import { Vocabulary } from "./vocabulary.entity";
import { User } from "./user.entity";

@Entity("favorite_vocabulary")
@Unique(["user", "vocabulary"])
export class FavoriteVocabulary {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Vocabulary, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "vocabulary_id" })
  vocabulary: Vocabulary;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;
}