import { Question } from "src/entities/question.entity";
import { ToeicSessionStore } from "../session/toeic-session.store";

export async function updateSession(mezonUserId: string, question: Question) {
  ToeicSessionStore.set(mezonUserId, {
    testId: question.test.id,
    partId: question.part.id,
  });
}