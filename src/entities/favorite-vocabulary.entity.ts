import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
  RelationId,
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

  @RelationId((user: User) => user.favorites)
  userId: number;

  @ManyToOne(() => Vocabulary, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "vocabulary_id" })
  vocabulary: Vocabulary;

  @RelationId((user: Vocabulary) => user.favorites)
  vocabularyId: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;
}