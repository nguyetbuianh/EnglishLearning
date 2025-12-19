export interface GuessWordInterface {
  vocabId: number,
  imageUrl: string,
  maskedWord: string
}

export interface VerifyWordInterface {
  vocabId: number,
  wordGuessed: string,
  userId: number
}