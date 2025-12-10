export const TOEIC_LISTENING_PART = {
  PART_1: 1,
  PART_2: 2,
  PART_3: 3,
  PART_4: 4,
};

export const TOEIC_READING_PART = {
  PART_5: 5,
  PART_6: 6,
  PART_7: 7,
};


export const TOEIC_PART = {
  1: { id: 1, start: 1, end: 6, total: 6 },
  2: { id: 2, start: 7, end: 31, total: 25 },
  3: { id: 3, start: 32, end: 70, total: 39 },
  4: { id: 4, start: 71, end: 100, total: 30 },
  5: { id: 5, start: 101, end: 130, total: 30 },
  6: { id: 6, start: 131, end: 146, total: 16 },
  7: { id: 7, start: 147, end: 200, total: 54 },
} as const;
