export interface AmortizationParams {
  principal: number;
  annualRate: number; // nominal, e.g. 0.065
  termMonths: number;
}

export function monthlyPayment({ principal, annualRate, termMonths }: AmortizationParams): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

export interface MonthSplit {
  payment: number;
  interest: number;
  principal: number;
  balanceAfter: number;
}

export function amortizeMonth(
  balanceBefore: number,
  annualRate: number,
  payment: number,
): MonthSplit {
  const r = annualRate / 12;
  const interest = balanceBefore * r;
  const principal = Math.min(balanceBefore, Math.max(0, payment - interest));
  const balanceAfter = Math.max(0, balanceBefore - principal);
  return { payment: interest + principal, interest, principal, balanceAfter };
}
