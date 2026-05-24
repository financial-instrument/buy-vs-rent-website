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

export function Inputs({ inputs }: { inputs: CountryInputs }) {
  const patch = useCalcStore((s) => s.patch);

  const set = <K extends keyof CountryInputs>(k: K, v: CountryInputs[K]) =>
    patch({ [k]: v } as Partial<CountryInputs>);

  return (
    <Accordion
      type="multiple"
      defaultValue={["home", "mortgage", "rent"]}
      className="w-full [&>div]:mb-3 [&>div]:overflow-hidden [&>div]:rounded-xl [&>div]:bg-card [&>div]:px-4 [&>div]:shadow-sm [&>div]:ring-1 [&>div]:ring-inset [&>div]:ring-border"
    >
      <AccordionItem value="home" className="border-0 border-l-4 border-l-buy/70">
        <AccordionTrigger>Home</AccordionTrigger>
        <AccordionContent className="grid gap-4 rounded-lg bg-muted/40 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          </div>
          {inputs.country === "nl" && (
            <NumberField
              label="WOZ value"
              glossaryId="woz"
              value={(inputs as NLInputs).wozValue}
              onChange={(v) => set("wozValue" as keyof CountryInputs, v as never)}
              step={1000}
            />
          )}
          {inputs.country === "it" && (
            <NumberField
              label="Cadastral value"
              glossaryId="cadastralValue"
              value={(inputs as ITInputs).cadastralValue}
              onChange={(v) => set("cadastralValue" as keyof CountryInputs, v as never)}
              step={1000}
            />
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="mortgage" className="border-0 border-l-4 border-l-buy/70">
        <AccordionTrigger>Mortgage</AccordionTrigger>
        <AccordionContent className="grid gap-4 rounded-lg bg-muted/40 p-3 sm:p-4">
          <SliderField
            label="Down payment"
            value={inputs.downPaymentPct}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => set("downPaymentPct", v)}
            formatter={(v) => `${(v * 100).toFixed(0)}%`}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          </div>
          <div
            className={
              inputs.country === "us"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-3"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2"
            }
          >
            {inputs.country === "us" && (
              <PercentField
                label="Closing costs (% of price)"
                value={inputs.closingCostsPct}
                onChange={(v) => set("closingCostsPct", v)}
                step={0.1}
                hint="Title, escrow, lender fees, etc. Combined with the flat amount."
              />
            )}
            <NumberField
              label="Closing costs (flat)"
              value={inputs.closingCostsFlat}
              onChange={(v) => set("closingCostsFlat", v)}
              step={500}
              min={0}
              hint={
                inputs.country === "us"
                  ? "Overbid, moving, anything not captured by the % above."
                  : "Overbid, valuation, moving, extra notary/advisor fees, anything beyond the itemized transfer/notary/registration costs below."
              }
            />
            <PercentField
              label="Sale costs (% of home value)"
              value={inputs.saleCostsPct}
              onChange={(v) => set("saleCostsPct", v)}
              step={0.1}
              hint="Agent, notary, transfer fees if you sold. 0% = accounting view."
            />
          </div>
          {inputs.country === "nl" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SwitchField
                label="NHG"
                glossaryId="nhg"
                checked={(inputs as NLInputs).nhg}
                onChange={(v) => set("nhg" as keyof CountryInputs, v as never)}
              />
              <SwitchField
                label="Interest-only product"
                checked={(inputs as NLInputs).interestOnly}
                onChange={(v) => set("interestOnly" as keyof CountryInputs, v as never)}
                hint="Disables HRA mortgage interest deduction."
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rent" className="border-0 border-l-4 border-l-rent/70">
        <AccordionTrigger>Rent</AccordionTrigger>
        <AccordionContent className="grid gap-4 rounded-lg bg-muted/40 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="investments" className="border-0 border-l-4 border-l-border">
        <AccordionTrigger>Investments</AccordionTrigger>
        <AccordionContent className="grid gap-4 rounded-lg bg-muted/40 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
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

      <AccordionItem value="tax" className="border-0 border-l-4 border-l-border">
        <AccordionTrigger>Tax &amp; household</AccordionTrigger>
        <AccordionContent className="grid gap-4 rounded-lg bg-muted/40 p-3 sm:p-4">
          {inputs.country === "us" && <USTaxFields inputs={inputs as USInputs} />}
          {inputs.country === "nl" && <NLTaxFields inputs={inputs as NLInputs} />}
          {inputs.country === "it" && <ITTaxFields inputs={inputs as ITInputs} />}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="policy" className="border-0 border-l-4 border-l-border">
        <AccordionTrigger>Policy simulation</AccordionTrigger>
        <AccordionContent className="grid gap-4 rounded-lg bg-muted/40 p-3 sm:p-4">
          <p className="text-[11px] text-muted-foreground">
            Simulate inflation indexing or future policy changes by escalating tax
            thresholds annually. Year-1 uses the base value; year N uses{" "}
            <code>base × (1 + growth)^(N − 1)</code>.
          </p>
          {inputs.country === "us" && <USPolicyFields inputs={inputs as USInputs} />}
          {inputs.country === "nl" && <NLPolicyFields inputs={inputs as NLInputs} />}
          {inputs.country === "it" && <ITPolicyFields inputs={inputs as ITInputs} />}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Filing status"
          glossaryId="filing"
          value={inputs.filing}
          options={[
            { value: "single", label: "Single" },
            { value: "mfj", label: "Married filing jointly" },
          ]}
          onChange={(v) => set("filing", v as USInputs["filing"])}
        />
        <NumberField
          label="Household income (annual)"
          value={inputs.householdIncomeAnnual}
          onChange={(v) => set("householdIncomeAnnual", v)}
          step={1000}
          hint="Drives the state-income leg of SALT."
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PercentField
          label="Federal marginal income rate"
          value={inputs.federalMarginalRate}
          onChange={(v) => set("federalMarginalRate", v)}
          step={1}
        />
        <PercentField
          label="State + local income rate"
          glossaryId="salt"
          value={inputs.stateLocalIncomeRate}
          onChange={(v) => set("stateLocalIncomeRate", v)}
          step={0.1}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PercentField
          label="Property tax (% of value)"
          value={inputs.propertyTaxRate}
          onChange={(v) => set("propertyTaxRate", v)}
          step={0.05}
        />
        <PercentField
          label="PMI rate (% of original loan)"
          glossaryId="pmi"
          value={inputs.pmiRate}
          onChange={(v) => set("pmiRate", v)}
          step={0.05}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Standard deduction — single"
          value={inputs.standardDeductionSingle}
          onChange={(v) => set("standardDeductionSingle", v)}
          step={500}
        />
        <NumberField
          label="Standard deduction — MFJ"
          value={inputs.standardDeductionMFJ}
          onChange={(v) => set("standardDeductionMFJ", v)}
          step={500}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="SALT cap"
          glossaryId="salt"
          value={inputs.saltCap}
          onChange={(v) => set("saltCap", v)}
          step={500}
        />
        <NumberField
          label="Acquisition debt cap (deductible interest base)"
          glossaryId="acquisitionDebtCap"
          value={inputs.acquisitionDebtCap}
          onChange={(v) => set("acquisitionDebtCap", v)}
          step={10_000}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PercentField
          label="Long-term capital gains rate"
          glossaryId="ltcg"
          value={inputs.ltcgRate}
          onChange={(v) => set("ltcgRate", v)}
          step={1}
        />
        <SwitchField
          label="NIIT (3.8% surtax)"
          glossaryId="niit"
          checked={inputs.niit}
          onChange={(v) => set("niit", v)}
        />
      </div>
    </>
  );
}

function NLTaxFields({ inputs }: { inputs: NLInputs }) {
  const patch = useCalcStore((s) => s.patch);
  const set = <K extends keyof NLInputs>(k: K, v: NLInputs[K]) =>
    patch({ [k]: v } as Partial<CountryInputs>);
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SwitchField
          label="Fiscal partner"
          glossaryId="partnered"
          checked={inputs.partnered}
          onChange={(v) => set("partnered", v)}
        />
        <SwitchField
          label="First-time buyer"
          checked={inputs.firstTimeBuyer}
          onChange={(v) => set("firstTimeBuyer", v)}
          hint="Skips overdrachtsbelasting below threshold."
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PercentField
          label="Marginal income tax rate"
          value={inputs.marginalRate}
          onChange={(v) => set("marginalRate", v)}
          step={0.1}
        />
        <PercentField
          label="HRA ceiling rate"
          glossaryId="hraCeiling"
          value={inputs.hraCeilingRate}
          onChange={(v) => set("hraCeilingRate", v)}
          step={0.1}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PercentField
          label="OZB rate (% of WOZ)"
          glossaryId="ozb"
          value={inputs.ozbRate}
          onChange={(v) => set("ozbRate", v)}
          step={0.01}
        />
        <PercentField
          label="EWF rate (low band)"
          glossaryId="ewf"
          value={inputs.ewfRateLow}
          onChange={(v) => set("ewfRateLow", v)}
          step={0.01}
        />
        <PercentField
          label="Transfer tax rate"
          glossaryId="transferTax"
          value={inputs.transferTaxRate}
          onChange={(v) => set("transferTaxRate", v)}
          step={0.1}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Box 3 regime"
          glossaryId="box3Mode"
          value={inputs.box3Mode}
          options={[
            { value: "deemed-2025", label: "2025 deemed yield (current)" },
            { value: "actual-2028", label: "2028 actual return (proposed)" },
            { value: "realized-cgt", label: "Realized CGT (counterfactual)" },
          ]}
          onChange={(v) => set("box3Mode", v as NLInputs["box3Mode"])}
        />
        {inputs.box3Mode === "realized-cgt" && (
          <PercentField
            label="Realized-CGT rate"
            glossaryId="box3Cgt"
            value={inputs.box3CgtRate}
            onChange={(v) => set("box3CgtRate", v)}
            step={0.5}
            hint="Illustrative ‘normal country’ rate. NL has no private CGT today — this is a counterfactual, not a Dutch proposal."
          />
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField
          label="Box 3 tax-free threshold (single)"
          glossaryId="box3Threshold"
          value={inputs.box3Threshold}
          onChange={(v) => set("box3Threshold", v)}
          step={500}
        />
        <PercentField
          label="Box 3 deemed yield"
          glossaryId="box3"
          value={inputs.box3DeemedYield}
          onChange={(v) => set("box3DeemedYield", v)}
          step={0.1}
        />
        <PercentField
          label="Box 3 tax rate"
          glossaryId="box3"
          value={inputs.box3TaxRate}
          onChange={(v) => set("box3TaxRate", v)}
          step={0.5}
        />
      </div>
      <PercentField
        label="Notary/advisor — deductible portion"
        glossaryId="notaryDeductible"
        value={inputs.notaryDeductiblePortion}
        onChange={(v) => set("notaryDeductiblePortion", v)}
        step={1}
        hint="Mortgage-deed share of the notary bundle. Refunded at marginal rate in year 1."
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          glossaryId="iva"
          value={inputs.agentIvaPct}
          onChange={(v) => set("agentIvaPct", v)}
          step={1}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField
          label="TARI (annual, flat)"
          glossaryId="tari"
          value={inputs.tariAnnual}
          onChange={(v) => set("tariAnnual", v)}
        />
        <PercentField
          label="Imposta di registro (% of cadastral)"
          glossaryId="registro"
          value={inputs.registrationTaxRate}
          onChange={(v) => set("registrationTaxRate", v)}
          step={0.1}
        />
        <PercentField
          label="Imposta sostitutiva mutuo (% of loan)"
          glossaryId="mutuoStampTax"
          value={inputs.mutuoStampTaxRate}
          onChange={(v) => set("mutuoStampTaxRate", v)}
          step={0.05}
          hint="Stamp tax at mortgage origination. 0.25% prima casa."
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PercentField
          label="Mutuo deduction rate"
          glossaryId="mutuo"
          value={inputs.mutuoDeductionRate}
          onChange={(v) => set("mutuoDeductionRate", v)}
          step={0.5}
        />
        <NumberField
          label="Mutuo interest cap (€/yr)"
          glossaryId="mutuoCap"
          value={inputs.mutuoInterestCap}
          onChange={(v) => set("mutuoInterestCap", v)}
          step={100}
        />
        <PercentField
          label="Bollo (annual, % of portfolio)"
          glossaryId="bollo"
          value={inputs.bolloRate}
          onChange={(v) => set("bolloRate", v)}
          step={0.05}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>
    </>
  );
}

function USPolicyFields({ inputs }: { inputs: USInputs }) {
  const patch = useCalcStore((s) => s.patch);
  const set = <K extends keyof USInputs>(k: K, v: USInputs[K]) =>
    patch({ [k]: v } as Partial<CountryInputs>);
  return (
    <>
      <PercentField
        label="Standard deduction — annual growth"
        value={inputs.standardDeductionGrowthPct}
        onChange={(v) => set("standardDeductionGrowthPct", v)}
        step={0.1}
        hint="0% = frozen at today's value."
      />
      <PercentField
        label="SALT cap — annual growth"
        value={inputs.saltCapGrowthPct}
        onChange={(v) => set("saltCapGrowthPct", v)}
        step={0.1}
      />
      <PercentField
        label="Acquisition debt cap — annual growth"
        value={inputs.acquisitionDebtCapGrowthPct}
        onChange={(v) => set("acquisitionDebtCapGrowthPct", v)}
        step={0.1}
      />
    </>
  );
}

function NLPolicyFields({ inputs }: { inputs: NLInputs }) {
  const patch = useCalcStore((s) => s.patch);
  const set = <K extends keyof NLInputs>(k: K, v: NLInputs[K]) =>
    patch({ [k]: v } as Partial<CountryInputs>);
  return (
    <>
      <PercentField
        label="Box 3 threshold — annual growth"
        glossaryId="box3Threshold"
        value={inputs.box3ThresholdGrowthPct}
        onChange={(v) => set("box3ThresholdGrowthPct", v)}
        step={0.1}
        hint="Allowance grows each year (e.g. 2% to track CPI)."
      />
      <PercentField
        label="WOZ — annual growth"
        glossaryId="woz"
        value={inputs.wozGrowthPct}
        onChange={(v) => set("wozGrowthPct", v)}
        step={0.1}
        hint="Drives EWF + OZB drift; independent of market home appreciation."
      />
    </>
  );
}

function ITPolicyFields({ inputs }: { inputs: ITInputs }) {
  const patch = useCalcStore((s) => s.patch);
  const set = <K extends keyof ITInputs>(k: K, v: ITInputs[K]) =>
    patch({ [k]: v } as Partial<CountryInputs>);
  return (
    <>
      <PercentField
        label="Mutuo cap — annual growth"
        glossaryId="mutuoCap"
        value={inputs.mutuoInterestCapGrowthPct}
        onChange={(v) => set("mutuoInterestCapGrowthPct", v)}
        step={0.1}
        hint="The €4,000 cap hasn't been indexed historically; set 0% to reflect that."
      />
    </>
  );
}
