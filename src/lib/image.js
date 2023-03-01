const resize = (img) => {
  const max_size = 640;
  let width = max_size;
  let height = max_size;
  const isPortrait = img.height > img.width;
  if (isPortrait) {
    width = (max_size / img.height) * img.width;
  } else {
    height = (max_size / img.width) * img.height;
  }
  return { width: width, height: height };
};

export { resize };
