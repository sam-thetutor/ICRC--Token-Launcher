export function shorten17String(str) {
    if (!str) return;
    if (str.length <= 11) {
      return str;
    } else {
      let firstPart = str.substring(0, 15);
      let lastPart = str.substring(str.length - 3);
      return `${firstPart}...${lastPart}`;
    }
  }
  