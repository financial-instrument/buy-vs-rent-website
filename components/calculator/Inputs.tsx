"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  NumberField,
  PercentField,
  SelectField,
  SliderField,
  SwitchField,
} from "./fields";
import { useCalcStore } from "./store";
import type { CountryInputs, ITInputs, NLInputs, USInputs } from "@/lib/calc/core/types";

export function Inputs() {
  const inputs = useCalcStore((s) => s.inputs);
  const patch = useCalcStore((s) => s.patch);
  if (!inputs) return null;

  const set = <K extends keyof CountryInputs>(k: K, v: CountryInputs[K]) =>
    patch({ [k]: v } as Partial<CountryInputs>);

  return (
    <Accordion type="multiple" defaultValue={["home", "mortgage", "rent"]} className="w-full">
      <AccordionItem value="home">
        <AccordionTrigger>Home</AccordionTrigger>
        <AccordionContent className="grid gap-4">
          <NumberField
            label="Home price"
            value={inputs.homePrice}
            onChange={(v) => set("homePrice", v)}
            step={1000}
          />
          <PercentField
            label="Annual appreciation"
            value={inputs.appreciationPct}
            onChange={(v) => set("appreciationPct", v)}
            step={0.1}
          />
          <PercentField
            label="Maintenance (% of value/yr)"
            value={inputs.maintenancePct}
            onChange={(v) => set("maintenancePct", v)}
            step={0.1}
          />
          <NumberField
            label="Annual home insurance"
            value={inputs.insuranceAnnual}
            onChange={(v) => set("insuranceAnnual", v)}
          />
          <NumberField
            label="HOA / monthly fee"
            value={inputs.hoaMonthly}
            onChange={(v) => set("hoaMonthly", v)}
          />
          {inputs.country === "nl" && (
            <NumberField
              label="WOZ value"
              value={(inputs as NLInputs).wozValue}
              onChange={(v) => set("wozValue" as keyof CountryInputs, v as never)}
              step={1000}
            />
          )}
          {inputs.country === "it" && (
            <NumberField
              label="Cadastral value (rendita × coefficient)"
              value={(inputs as ITInputs).cadastralValue}
              onChange={(v) => set("cadastralValue" as keyof CountryInputs, v as never)}
              step={1000}
            />
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="mortgage">
        <AccordionTrigger>Mortgage</AccordionTrigger>
        <AccordionContent className="grid gap-4">
          <SliderField
            label="Down payment"
            value={inputs.downPaymentPct}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => set("downPaymentPct", v)}
            formatter={(v) => `${(v * 100).toFixed(0)}%`}
          />
          <PercentField
            label="Mortgage rate (annual)"
            value={inputs.mortgageRate}
            onChange={(v) => set("mortgageRate", v)}
            step={0.05}
          />
          <NumberField
            label="Mortgage term (years)"
            value={inputs.termYears}
            onChange={(v) => set("termYears", Math.round(v))}
            min={1}
            max={40}
          />
          <NumberField
            label="Time horizon (years)"
            value={inputs.horizonYears}
            onChange={(v) => set("horizonYears", Math.round(v))}
            min={1}
            max={inputs.termYears}
            hint={`Must be ≤ term (${inputs.termYears} yr)`}
          />
          <PercentField
            label="Buy-side closing costs (% of price)"
            value={inputs.closingCostsPct}
            onChange={(v) => set("closingCostsPct", v)}
            step={0.1}
          />
          {inputs.country === "nl" && (
            <>
              <SwitchField
                label="NHG"
                checked={(inputs as NLInputs).nhg}
                onChange={(v) => set("nhg" as keyof CountryInputs, v as never)}
                hint="Eligible if home ≤ NHG threshold; reduces effective rate."
              />
              <SwitchField
                label="Interest-only product"
                checked={(inputs as NLInputs).interestOnly}
                onChange={(v) => set("interestOnly" as keyof CountryInputs, v as never)}
                hint="Disables HRA mortgage interest deduction."
              />
            </>
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rent">
        <AccordionTrigger>Rent</AccordionTrigger>
        <AccordionContent className="grid gap-4">
          <NumberField
            label="Monthly rent (all-in)"
            value={inputs.monthlyRent}
            onChange={(v) => set("monthlyRent", v)}
          />
          <PercentField
            label="Annual rent inflation"
            value={inputs.rentInflationPct}
            onChange={(v) => set("rentInflationPct", v)}
            step={0.1}
          />
          <PercentField
            label="CPI (display only)"
            value={inputs.cpiPct}
            onChange={(v) => set("cpiPct", v)}
            step={0.1}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="investments">
        <AccordionTrigger>Investments</AccordionTrigger>
        <AccordionContent className="grid gap-4">
          <PercentField
            label="Equity expected return"
            value={inputs.equityReturnPct}
            onChange={(v) => set("equityReturnPct", v)}
            step={0.1}
          />
          <PercentField
            label="Bond expected return"
            value={inputs.bondReturnPct}
            onChange={(v) => set("bondReturnPct", v)}
            step={0.1}
          />
          <SliderField
            label="Equity / bond split"
            value={inputs.equitySplit}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => set("equitySplit", v)}
            formatter={(v) => `${(v * 100).toFixed(0)} / ${(100 - v * 100).toFixed(0)}`}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tax">
        <AccordionTrigger>Tax & household</AccordionTrigger>
        <AccordionContent className="grid gap-4">
          {inputs.country === "us" && <USTaxFields inputs={inputs as USInputs} />}
          {inputs.country === "nl" && <NLTaxFields inputs={inputs as NLInputs} />}
          {inputs.country === "it" && <ITTaxFields inputs={inputs as ITInputs} />}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function USTaxFields({ inputs }: { inputs: USInputs }) {
  const patch = useCalcStore((s) => s.patch);
  const set = <K extends keyof USInputs>(k: K, v: USInputs[K]) =>
    patch({ [k]: v } as Partial<CountryInputs>);
  return (
    <>
      <SelectField
        label="Filing status"
        value={inputs.filing}
        options={[
          { value: "single", label: "Single" },
          { value: "mfj", label: "Married filing jointly" },
        ]}
        onChange={(v) => set("filing", v as USInputs["filing"])}
      />
      <PercentField
        label="Federal marginal income rate"
        value={inputs.federalMarginalRate}
        onChange={(v) => set("federalMarginalRate", v)}
        step={1}
      />
      <PercentField
        label="State + local income rate"
        value={inputs.stateLocalIncomeRate}
        onChange={(v) => set("stateLocalIncomeRate", v)}
        step={0.1}
      />
      <PercentField
        label="Property tax (% of value)"
        value={inputs.propertyTaxRate}
        onChange={(v) => set("propertyTaxRate", v)}
        step={0.05}
      />
      <PercentField
        label="PMI rate (% of original loan, while LTV > 80%)"
        value={inputs.pmiRate}
        onChange={(v) => set("pmiRate", v)}
        step={0.05}
      />
      <PercentField
        label="Long-term capital gains rate"
        value={inputs.ltcgRate}
        onChange={(v) => set("ltcgRate", v)}
        step={1}
      />
      <SwitchField
        label="NIIT (3.8% surtax)"
        checked={inputs.niit}
        onChange={(v) => set("niit", v)}
      />
    </>
  );
}

function NLTaxFields({ inputs }: { inputs: NLInputs }) {
  const patch = useCalcStore((s) => s.patch);
  const set = <K extends keyof NLInputs>(k: K, v: NLInputs[K]) =>
    patch({ [k]: v } as Partial<CountryInputs>);
  return (
    <>
      <SwitchField
        label="Fiscal partner"
        checked={inputs.partnered}
        onChange={(v) => set("partnered", v)}
        hint="Doubles the Box 3 tax-free threshold."
      />
      <PercentField
        label="Marginal income tax rate"
        value={inputs.marginalRate}
        onChange={(v) => set("marginalRate", v)}
        step={0.1}
      />
      <PercentField
        label="HRA ceiling rate (deduction cap)"
        value={inputs.hraCeilingRate}
        onChange={(v) => set("hraCeilingRate", v)}
        step={0.1}
      />
      <PercentField
        label="OZB property tax rate (% of WOZ)"
        value={inputs.ozbRate}
        onChange={(v) => set("ozbRate", v)}
        step={0.01}
      />
      <SwitchField
        label="First-time buyer"
        checked={inputs.firstTimeBuyer}
        onChange={(v) => set("firstTimeBuyer", v)}
        hint="Skips overdrachtsbelasting (transfer tax) below threshold."
      />
    </>
  );
}

function ITTaxFields({ inputs }: { inputs: ITInputs }) {
  const patch = useCalcStore((s) => s.patch);
  const set = <K extends keyof ITInputs>(k: K, v: ITInputs[K]) =>
    patch({ [k]: v } as Partial<CountryInputs>);
  return (
    <>
      <PercentField
        label="Notary fees (% of price)"
        value={inputs.notaryPct}
        onChange={(v) => set("notaryPct", v)}
        step={0.1}
      />
      <PercentField
        label="Real-estate agent (% of price)"
        value={inputs.agentPct}
        onChange={(v) => set("agentPct", v)}
        step={0.1}
      />
      <PercentField
        label="IVA on agent fee"
        value={inputs.agentIvaPct}
        onChange={(v) => set("agentIvaPct", v)}
        step={1}
      />
      <NumberField
        label="TARI (annual, flat)"
        value={inputs.tariAnnual}
        onChange={(v) => set("tariAnnual", v)}
      />
      <PercentField
        label="Equity ETF realization tax"
        value={inputs.equityCgtRate}
        onChange={(v) => set("equityCgtRate", v)}
        step={0.5}
      />
      <PercentField
        label="Gov-bond realization tax"
        value={inputs.bondCgtRate}
        onChange={(v) => set("bondCgtRate", v)}
        step={0.5}
      />
    </>
  );
}
