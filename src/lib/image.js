const resize = (img, max) => {
  const max_size = max || 640;
  let width = max_size;
  let height = max_size;
  if (!img || !img.width) return { width: width, height: height };

  const isPortrait = img.height > img.width;
  if (isPortrait) {
    width = Math.floor((max_size / img.height) * img.width);
  } else {
    height = Math.floor((max_size / img.width) * img.height);
  }
  return { width: width, height: height };
};

const thumb = img => {
  const thumb = new Image();
  const size = resize(img, 100);
  thumb.width = size.width;
  thumb.height = size.height;
};

export { resize, thumb };
