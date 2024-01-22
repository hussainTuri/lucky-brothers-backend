export const toNumber = (value: any, defaultValue: any = null) => {
  return value !== null && value !== undefined ? Number(value) : defaultValue;
};

export const incrementSku = (sku: string): string => {
  const matchResult = sku.match(/(.*-)(0*)(\d+)/);

  if (matchResult !== null) {
    const [, prefix, leadingZeros, numberPart] = matchResult;
    const incrementedNumber = (parseInt(numberPart, 10) + 1).toString();
    const newNumberPart = '0'.repeat(leadingZeros.length) + incrementedNumber;
    return prefix + newNumberPart;
  }

  return sku;
};

export const UCFirstLCRest = (inputString: string): string => {
  if (typeof inputString !== 'string') return inputString;

  return inputString
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const UCFirst = (inputString: string): string => {
  if (typeof inputString !== 'string') return inputString;

  return inputString
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const trimSpaces = (inputString: string): string => {
  if (typeof inputString !== 'string') return inputString;
  return inputString.replace(/\s+/g, ' ').trim();
};
