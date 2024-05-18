export function sanitizeBody(html, length) {
    if (html === undefined) {
      return '';
    }
    html = html.replace(/<\/?[^>]+(>|$)/g, "");
    return html.substring(0, length) + (html.length > length ? '...' : '');
}

export function emptyHTML(html) {
  
  if (html === undefined) {
    return true;
  }
  
  const regexExp = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
  return html.replace(/<\/?[^>]+(>|$)/g, "").length === 0 && !regexExp.test(html);
}

export function isVowel(x) {
  switch(x.toUpperCase()) {
    case 'A':
      return true;
    case 'E':
      return true;
    case 'I':
      return true;
    case 'O':
      return true;
    case 'U':
      return true;
    default:
      return false;
  }
}

export function stringMatching(string, data) {
  const regex = new RegExp(string.toLowerCase(), "g");
  const matches = data.filter(s => {
    return Boolean(s.string.toLowerCase().match(regex));
  })
  return matches;
}

export const pluralize = (string, count) => {
  if (count > 1 || count === 0) {
    return string + 's'
  } else {
    return string;
  }
}

export const truncate = (string, length) => {
  if (string.length <= length) {
    return string
  } else {
    return `${string.substring(0, length)}...`
  }
}


export function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}