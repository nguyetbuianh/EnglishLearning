export const ChainWordStore = new Map<string, string[]>();

export function addWord(userId: string, word: string) {
  if (!ChainWordStore.has(userId)) {
    ChainWordStore.set(userId, []);
  }
  const arr = ChainWordStore.get(userId)!;
  arr.push(word);
}

export function checkWordExists(userId: string, word: string): boolean {
  const arr = ChainWordStore.get(userId);
  if (!arr) return false;
  return arr.includes(word);
}

export function resetUserWords(userId: string) {
  ChainWordStore.delete(userId);
}
