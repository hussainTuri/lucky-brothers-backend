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
