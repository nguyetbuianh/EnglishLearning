export function maskWord(word: string): string {
  const words = word.split(' ');

  const maskedWords = words.map(w => {
    if (w.length <= 2) return w;

    const chars = w.split('');
    const hideCount = Math.max(1, Math.floor(w.length * 0.4));

    const indices = [...Array(w.length).keys()];
    const hiddenIndices = indices.sort(() => 0.5 - Math.random()).slice(0, hideCount);

    hiddenIndices.forEach(i => {
      chars[i] = '_';
    });

    return chars.join('');
  });

  return maskedWords.join(' ');
}