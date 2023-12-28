export const  stringToNumber = (input: string): number => {
  const parsedNumber = Number(input.trim());
  if (!isNaN(parsedNumber)) {
    return parsedNumber;
  }
  return NaN;
}
