export const isBetween = (num: number, num1: number, num2: number) => (
  (num >= num1 && num <= num2) || (num <= num1 && num >= num2)
);