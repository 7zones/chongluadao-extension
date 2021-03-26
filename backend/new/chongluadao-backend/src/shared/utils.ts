export const preProcessLinkToDomainUrl = (url) => {
  let newUrl = url;
  const indices = [];

  for (let i = 0; i < newUrl.length; i++) {
    if (newUrl[i] === '/') indices.push(i);
  }

  if (newUrl.includes('http') || newUrl.includes('https')) {
    newUrl = newUrl.substring(0, indices[2]);
    if (newUrl.includes('http')) {
      newUrl = newUrl.substring(8, newUrl.length);
    } else if (newUrl.includes('https')) {
      newUrl = newUrl.substring(9, newUrl.length);
    }
  } else {
    newUrl = newUrl.substring(0, indices[0]);
  }
  return newUrl;
};

export const removeHttpFromLink = (url) => {
  let newUrl = url;
  if (newUrl.includes('http')) {
    newUrl = newUrl.substring(8, newUrl.length);
  } else if (newUrl.includes('https')) {
    newUrl = newUrl.substring(9, newUrl.length);
  }
  return newUrl;
};
