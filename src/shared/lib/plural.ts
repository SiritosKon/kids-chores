export const pluralize = (count: number, forms: readonly [string, string, string]): string => {
  const absolute = Math.abs(count) % 100;
  const tail = absolute % 10;

  if (absolute > 10 && absolute < 20) {
    return forms[2];
  }
  if (tail > 1 && tail < 5) {
    return forms[1];
  }
  if (tail === 1) {
    return forms[0];
  }
  return forms[2];
};
