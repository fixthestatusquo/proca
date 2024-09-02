const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const sample = (array, sampleSize) => {
  if (!sampleSize || sampleSize === 1) {
    return [array[Math.floor(Math.random() * array.length)]];
  }

  const copy = [...array];
  shuffle(copy);
  return copy.slice(0, sampleSize);
};
export { shuffle, sample };
