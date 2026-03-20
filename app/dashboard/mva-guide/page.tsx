// app/dashboard/mva-guide/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function MVAGuidePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
          Reference
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          Norwegian MVA (VAT) — Practical Guide
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Key rules for freelancers and small businesses operating in Norway.
          Not a substitute for professional accounting advice.
        </p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-foreground">

        {/* Section 1 */}
        <section>
          <h2 className="text-base font-semibold mb-3">What is MVA?</h2>
          <p className="text-muted-foreground mb-3">
            MVA (Merverdiavgift) is a consumption tax applied to the sale of
            most goods and services in Norway. As a business, you collect it on
            behalf of the Norwegian Tax Administration (Skatteetaten).
          </p>
          <ul className="space-y-1.5 text-muted-foreground list-none">
            <li className="flex gap-2">
              <span className="text-foreground">—</span>
              You charge MVA on sales (<em>utgående mva</em> / output VAT)
            </li>
            <li className="flex gap-2">
              <span className="text-foreground">—</span>
              You deduct MVA on business expenses (<em>inngående mva</em> / input VAT)
            </li>
            <li className="flex gap-2">
              <span className="text-foreground">—</span>
              The difference is paid to or refunded by the tax authorities
            </li>
          </ul>
          <div className="mt-4 border-l-2 border-border pl-4 py-1">
            <p className="text-foreground font-medium">
              Standard MVA rate: <span className="font-bold">25%</span>
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              15% on food · 12% on transport/hotels · 0% on exports
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-base font-semibold mb-3">
            The NOK 50,000 Registration Threshold
          </h2>
          <div className="border-l-2 border-foreground pl-4 py-1 mb-4">
            <p className="font-medium">
              You must register for MVA when taxable turnover exceeds NOK 50,000
              within any rolling 12-month period.
            </p>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">Taxable turnover</strong> includes
              sales of all goods and services subject to MVA. Exempt services
              (healthcare, education) do not count.
            </p>
            <p>
              <strong className="text-foreground">Rolling 12 months</strong> means
              not a calendar year — you must continuously monitor your total
              sales over the last 12 months.
            </p>
          </div>
          <div className="mt-4 rounded border border-border bg-muted/50 p-4 text-muted-foreground">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground mb-1.5">
              Example
            </p>
            If your turnover from March last year to February this year is
            NOK 51,000, you must register — even if your calendar-year turnover
            was lower.
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-base font-semibold mb-3">
            Crossing the Threshold — What to Do
          </h2>
          <p className="text-muted-foreground mb-4">
            The invoice that pushes you over NOK 50,000 must already include
            MVA. The obligation begins with the transaction that causes you to
            exceed the limit.
          </p>
          <div className="rounded border border-border p-4 mb-4 space-y-1 text-muted-foreground">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground mb-2">
              Example — Invoice Calculation
            </p>
            <p>Invoice amount: <strong className="text-foreground">NOK 5,000</strong></p>
            <p>+ 25% MVA: <strong className="text-foreground">NOK 1,250</strong></p>
            <p className="pt-1 border-t border-border text-foreground font-semibold">
              Total: NOK 6,250
            </p>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">Add a note to the invoice</strong> —
              since you don&apos;t have an MVA number yet, include:
            </p>
            <div className="rounded border border-border bg-muted/50 px-4 py-3 font-mono text-xs text-foreground">
              &quot;Selskapet er under registrering i Merverdiavgiftsregisteret.&quot;
            </div>
            <p className="text-xs text-muted-foreground">
              English: &quot;The company is undergoing registration in the VAT Register.&quot;
            </p>
            <p>
              <strong className="text-foreground">Register immediately</strong> —
              submit your registration to Brønnøysundregistrene without delay.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-base font-semibold mb-3">
            Life as an MVA-Registered Business
          </h2>
          <div className="divide-y divide-border border border-border rounded overflow-hidden">
            <div className="grid grid-cols-[80px_1fr] text-xs font-medium uppercase tracking-wide bg-muted/50">
              <div className="px-4 py-2.5 text-muted-foreground">Rule</div>
              <div className="px-4 py-2.5 text-muted-foreground border-l border-border">Detail</div>
            </div>
            <div className="grid grid-cols-[80px_1fr]">
              <div className="px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wide">
                Must
              </div>
              <div className="px-4 py-3 border-l border-border text-muted-foreground">
                <strong className="text-foreground">Charge MVA</strong> on all taxable sales in Norway,
                regardless of annual turnover. The 50k threshold is for registration only.
              </div>
            </div>
            <div className="grid grid-cols-[80px_1fr]">
              <div className="px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wide">
                Can
              </div>
              <div className="px-4 py-3 border-l border-border text-muted-foreground">
                <strong className="text-foreground">Deduct MVA</strong> on business purchases —
                tools, software, rent, professional services.
              </div>
            </div>
            <div className="grid grid-cols-[80px_1fr]">
              <div className="px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wide">
                Must
              </div>
              <div className="px-4 py-3 border-l border-border text-muted-foreground">
                <strong className="text-foreground">File MVA returns</strong> — usually every
                two months, detailing collected and paid MVA.
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-base font-semibold mb-3">Deregistering from MVA</h2>
          <p className="text-muted-foreground mb-3">
            You can apply to be removed from the MVA Register if your turnover
            has stayed below NOK 50,000 for a full 12-month period. This is not
            automatic — you must apply to the Tax Administration.
          </p>
          <p className="text-muted-foreground">
            If approved: you must stop charging MVA and lose the right to deduct
            MVA on expenses.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-base font-semibold mb-3">Other Concepts</h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">Reverse Charge (Snudd Regning)</p>
              <p>
                A special B2B rule (common in construction) where the buyer, not the
                seller, is responsible for calculating and reporting MVA. This is not
                a general alternative to charging MVA when your turnover is low.
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="font-medium text-foreground mb-1">Exports / Sales Outside Norway</p>
              <p>
                If you&apos;re MVA-registered and selling services to clients outside Norway,
                the sale is generally zero-rated (0% MVA). You must still report it on
                your MVA return.
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="font-medium text-foreground mb-1">EEA Companies</p>
              <p>
                Companies from within the EEA (EU + Iceland, Liechtenstein) — including
                Polish companies — can register for MVA in Norway directly without a
                Norwegian fiscal representative.
              </p>
            </div>
          </div>
        </section>

        {/* Summary Table */}
        <section>
          <h2 className="text-base font-semibold mb-3">Status at a Glance</h2>
          <div className="overflow-x-auto rounded border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Charge MVA?</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deduct MVA?</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Below 50k threshold</td>
                  <td className="px-4 py-3 text-muted-foreground">No</td>
                  <td className="px-4 py-3 text-muted-foreground">No</td>
                  <td className="px-4 py-3 text-muted-foreground">Monitor rolling 12-month turnover</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">About to cross 50k</td>
                  <td className="px-4 py-3 text-foreground font-medium">Yes — on the crossing invoice</td>
                  <td className="px-4 py-3 text-foreground font-medium">Yes — retroactively</td>
                  <td className="px-4 py-3 text-foreground font-medium">Register immediately</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Registered</td>
                  <td className="px-4 py-3 text-foreground font-medium">Yes — always</td>
                  <td className="px-4 py-3 text-foreground font-medium">Yes</td>
                  <td className="px-4 py-3 text-muted-foreground">File returns every 2 months</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-muted-foreground">Deregistered</td>
                  <td className="px-4 py-3 text-muted-foreground">No</td>
                  <td className="px-4 py-3 text-muted-foreground">No</td>
                  <td className="px-4 py-3 text-muted-foreground">Re-register if turnover rises again</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground border-t border-border pt-6">
          This page provides general information and is not legal or financial
          advice. Consult a certified Norwegian accountant (regnskapsfører) for
          your specific situation.
        </p>

      </div>
    </div>
  )
}
