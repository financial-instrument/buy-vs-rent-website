import { amortizeMonth, monthlyPayment } from "./amortization";
import {
  annualToMonthly,
  applyMonthlyReturn,
  bucketTotal,
  contribute,
  emptyBucket,
  rebalance,
  withdraw,
  type BucketState,
} from "./portfolio";
import type { CountryRules } from "./rules";
import type {
  CountryInputs,
  MonthlyState,
  SimulationResult,
  YearlySnapshot,
} from "./types";

// Symmetric differential simulator.
//
//   t=0: buyer pays W0 = downPayment + closingCosts; renter invests W0.
//   each month: Δ_t = Buy_t − Rent_t. The lower-outflow side invests |Δ_t|.
//   year tick: country annual buy-side tax effect is netted into buy-side cash;
//              portfolio drag (NL Box 3, IT bollo) bleeds out of each portfolio.
//
// Rebalance is annual at year tick.

export function simulate(input: CountryInputs, rules: CountryRules): SimulationResult {
  const horizonMonths = input.horizonYears * 12;
  const termMonths = input.termYears * 12;

  const downPayment = input.homePrice * input.downPaymentPct;
  const loanPrincipal = input.homePrice - downPayment;

  const closing = rules.oneTimeCosts(input, loanPrincipal);
  const W0 = downPayment + closing.closingTotal;

  const effRate = rules.effectiveRate(input);
  const M = monthlyPayment({
    principal: loanPrincipal,
    annualRate: effRate,
    termMonths,
  });

  const monthlyAppreciation = annualToMonthly(input.appreciationPct);
  const monthlyEquityReturn = annualToMonthly(input.equityReturnPct);
  const monthlyBondReturn = annualToMonthly(input.bondReturnPct);

  // Initial state
  let loanBalance = loanPrincipal;
  let homeValue = input.homePrice;
  // Renter starts with W0 invested; buyer's portfolio starts empty (W0 went into the house).
  let buyBucket: BucketState = emptyBucket();
  let rentBucket: BucketState = contribute(emptyBucket(), W0, input.equitySplit);

  let monthlyRent = input.monthlyRent;

  const monthly: MonthlyState[] = [];
  const yearly: YearlySnapshot[] = [];

  // Per-year accumulators (reset each calendar year).
  let yrInterest = 0;
  let yrPrincipal = 0;
  let yrPropertyTax = 0;
  let yrPMI = 0;
  let yrBuyOutflow = 0;
  let yrRentOutflow = 0;
  let yrBalanceSum = 0;
  let yrBalanceCount = 0;

  for (let t = 1; t <= horizonMonths; t++) {
    const yearIndex0 = Math.floor((t - 1) / 12); // 0-based year of THIS month

    // Apply portfolio returns for the month BEFORE adding this month's contribution.
    buyBucket = applyMonthlyReturn(buyBucket, monthlyEquityReturn, monthlyBondReturn);
    rentBucket = applyMonthlyReturn(rentBucket, monthlyEquityReturn, monthlyBondReturn);

    // Mortgage step
    const split = loanBalance > 0
      ? amortizeMonth(loanBalance, effRate, M)
      : { payment: 0, interest: 0, principal: 0, balanceAfter: 0 };
    const balBefore = loanBalance;
    loanBalance = split.balanceAfter;

    yrInterest += split.interest;
    yrPrincipal += split.principal;
    yrBalanceSum += balBefore;
    yrBalanceCount += 1;

    // Home appreciation (geometric monthly)
    homeValue = homeValue * (1 + monthlyAppreciation);

    // Recurring buy-side monthly costs
    const propertyTax = monthlyPropertyTax(input, homeValue);
    const insurance = input.insuranceAnnual / 12;
    const hoa = input.hoaMonthly;
    const maintenance = (input.maintenancePct * homeValue) / 12;
    const ltv = homeValue > 0 ? loanBalance / homeValue : 0;
    const pmi = monthlyPMI(input, loanPrincipal, ltv);
    const extras = rules.monthlyExtras(input, {
      monthIndex: t - 1,
      yearIndex: yearIndex0,
      loanBalance,
      homeValue,
      interestThisMonth: split.interest,
      loanOriginal: loanPrincipal,
    });

    yrPropertyTax += propertyTax;
    yrPMI += pmi;

    const buyOutflow =
      split.payment + propertyTax + insurance + hoa + maintenance + pmi + extras.countryAdj;
    const rentOutflow = monthlyRent;

    yrBuyOutflow += buyOutflow;
    yrRentOutflow += rentOutflow;

    // Symmetric differential
    const delta = buyOutflow - rentOutflow;
    if (delta > 0) {
      rentBucket = contribute(rentBucket, delta, input.equitySplit);
    } else if (delta < 0) {
      buyBucket = contribute(buyBucket, -delta, input.equitySplit);
    }

    // Push the monthly snapshot
    monthly.push({
      month: t,
      year: Math.ceil(t / 12),
      loanBalance,
      homeValue,
      monthlyRent,
      buyOutflow,
      rentOutflow,
      buyPortfolio: bucketTotal(buyBucket),
      rentPortfolio: bucketTotal(rentBucket),
      buyBasis: buyBucket.equityBasis + buyBucket.bondBasis,
      rentBasis: rentBucket.equityBasis + rentBucket.bondBasis,
      buyEquityValue: buyBucket.equityValue,
      buyBondValue: buyBucket.bondValue,
      rentEquityValue: rentBucket.equityValue,
      rentBondValue: rentBucket.bondValue,
      buyEquityBasis: buyBucket.equityBasis,
      buyBondBasis: buyBucket.bondBasis,
      rentEquityBasis: rentBucket.equityBasis,
      rentBondBasis: rentBucket.bondBasis,
      components: {
        pi: split.payment,
        propertyTax,
        insurance,
        hoa,
        maintenance,
        pmi,
        countryAdj: extras.countryAdj,
      },
    });

    // YEAR TICK
    if (t % 12 === 0) {
      const yearIndex1 = t / 12;
      const avgBal = yrBalanceCount > 0 ? yrBalanceSum / yrBalanceCount : 0;

      // Annual buy-side tax (HRA refund / MID benefit / mutuo deduction / EWF / etc).
      const annualTax = rules.annualBuyTax(input, {
        yearIndex: yearIndex1,
        interestPaidYear: yrInterest,
        principalPaidYear: yrPrincipal,
        avgLoanBalanceYear: avgBal,
        endOfYearLoanBalance: loanBalance,
        endOfYearHomeValue: homeValue,
        propertyTaxYear: yrPropertyTax,
        pmiYear: yrPMI,
      });

      // Net into the buy side once. Negative = refund: buyer "saves" that cash → invests it.
      // Positive = extra tax: buyer must pull from portfolio (or rent side gets the diff).
      // We model both symmetrically: if the buyer's effective annual cash improves by X,
      // X gets contributed to the buy portfolio. If it worsens, X is withdrawn (or, if the
      // portfolio is empty, the rent side gets X added to keep symmetry).
      const buyCashImprovement = -annualTax.netCashEffect;
      if (buyCashImprovement > 0) {
        buyBucket = contribute(buyBucket, buyCashImprovement, input.equitySplit);
      } else if (buyCashImprovement < 0) {
        const need = -buyCashImprovement;
        if (bucketTotal(buyBucket) >= need) {
          const w = withdraw(buyBucket, need);
          buyBucket = w.bucket;
        } else {
          // Buyer can't afford: rent side gets the equivalent advantage instead.
          rentBucket = contribute(rentBucket, need, input.equitySplit);
        }
      }

      // Portfolio drag (NL Box 3 / IT bollo). Always paid out of the relevant portfolio.
      const drag = rules.annualPortfolioDrag(input, buyBucket, rentBucket);
      if (drag.buyDrag > 0) {
        const w = withdraw(buyBucket, drag.buyDrag);
        buyBucket = w.bucket;
      }
      if (drag.rentDrag > 0) {
        const w = withdraw(rentBucket, drag.rentDrag);
        rentBucket = w.bucket;
      }

      // Annual rebalance (default on)
      buyBucket = rebalance(buyBucket, input.equitySplit);
      rentBucket = rebalance(rentBucket, input.equitySplit);

      // Step rent for next year
      monthlyRent = monthlyRent * (1 + input.rentInflationPct);

      // Build snapshot
      const cgt = rules.unrealizedCGT(input, buyBucket, rentBucket);
      const rentNetWorth = bucketTotal(rentBucket) - cgt.rentCGT;
      const buyNetWorth = (homeValue - loanBalance) + bucketTotal(buyBucket);

      yearly.push({
        year: yearIndex1,
        loanBalance,
        homeValue,
        buyPortfolio: bucketTotal(buyBucket),
        rentPortfolio: bucketTotal(rentBucket),
        buyNetWorth,
        rentNetWorth,
        rentUnrealizedCGT: cgt.rentCGT,
        annualBuyTaxEffect: annualTax.netCashEffect,
        annualPortfolioDrag: drag.buyDrag + drag.rentDrag,
        totalBuyOutflowYear: yrBuyOutflow,
        totalRentOutflowYear: yrRentOutflow,
      });

      // Reset accumulators
      yrInterest = 0;
      yrPrincipal = 0;
      yrPropertyTax = 0;
      yrPMI = 0;
      yrBuyOutflow = 0;
      yrRentOutflow = 0;
      yrBalanceSum = 0;
      yrBalanceCount = 0;
    }
  }

  const last = yearly[yearly.length - 1];
  const finalBuyNetWorth = last?.buyNetWorth ?? 0;
  const finalRentNetWorth = last?.rentNetWorth ?? 0;
  const delta = finalBuyNetWorth - finalRentNetWorth;
  const winner: "buy" | "rent" | "tie" =
    Math.abs(delta) < 1 ? "tie" : delta > 0 ? "buy" : "rent";

  return {
    monthly,
    yearly,
    inputs: input,
    W0,
    loanPrincipal,
    monthlyPayment: M,
    finalBuyNetWorth,
    finalRentNetWorth,
    delta,
    winner,
  };
}

function monthlyPropertyTax(input: CountryInputs, homeValue: number): number {
  if (input.country === "us") {
    return (input.propertyTaxRate * homeValue) / 12;
  }
  if (input.country === "nl") {
    // OZB applied to WOZ value — not the live home value.
    // We approximate by applying ozbRate to wozValue (assumed flat in v1).
    return (input.ozbRate * input.wozValue) / 12;
  }
  // IT prima casa: IMU exempt; TARI is annual flat (handled below as countryAdj? No —
  // TARI is also a recurring cost, so we surface it here as the "property tax" line.
  if (input.country === "it") {
    return input.tariAnnual / 12;
  }
  return 0;
}

function monthlyPMI(input: CountryInputs, loanOriginal: number, ltv: number): number {
  if (input.country !== "us") return 0;
  if (ltv <= 0.8) return 0;
  return (input.pmiRate * loanOriginal) / 12;
}
