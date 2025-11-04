// app/dashboard/mva-guide/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'

export default async function MVAGuidePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Your Essential Guide to Norwegian MVA (VAT)
        </h1>
        <p className="text-lg text-muted-foreground">
          Navigating the Norwegian tax system can be complex, especially when it
          comes to Merverdiavgift (MVA), Norway's Value Added Tax (VAT). This
          guide provides the essential information you need to know to stay
          compliant, make informed decisions, and manage your business
          correctly.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              1. What is MVA?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-card-foreground">
              MVA is a consumption tax applied to the sale of most goods and
              services in Norway. When you run a business, you often act as a
              tax collector on behalf of the Norwegian Tax Administration
              (Skatteetaten).
            </p>
            <ul className="list-disc ml-6 space-y-2 text-card-foreground">
              <li>
                You charge MVA on your sales (this is called{' '}
                <strong>output MVA</strong> or <em>utgående mva</em>).
              </li>
              <li>
                You can deduct the MVA you pay on your business-related expenses
                (this is called <strong>input MVA</strong> or{' '}
                <em>inngående mva</em>).
              </li>
              <li>
                The difference is paid to or refunded by the tax authorities.
              </li>
            </ul>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border-l-4 border-blue-600 dark:border-blue-400">
              <p className="font-semibold text-blue-900 dark:text-blue-200">
                The standard MVA rate in Norway is{' '}
                <span className="text-2xl">25%</span>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              2. The Golden Rule: The NOK 50,000 Registration Threshold
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950 p-4 border-l-4 border-orange-600 dark:border-orange-400">
              <p className="font-bold text-orange-900 dark:text-orange-200 text-lg">
                You are legally obligated to register your business in the MVA
                Register when your taxable turnover exceeds NOK 50,000 within
                any 12-month period.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-foreground">
                  📊 "Taxable Turnover":
                </p>
                <p className="text-muted-foreground">
                  This includes sales of all goods and services that are subject
                  to MVA. Some services (like healthcare and education) are
                  exempt and do not count towards this total.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  📅 "12-Month Period":
                </p>
                <p className="text-muted-foreground">
                  This is a rolling period, not a calendar year. You must
                  constantly monitor your total sales over the last 12 months.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold mb-2 text-foreground">Example:</p>
              <p className="text-card-foreground">
                If your turnover from March last year to February this year is
                NOK 51,000, you must register, even if your turnover for the
                calendar year was lower.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              3. The Critical Moment: Crossing the NOK 50,000 Threshold
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold text-red-900 dark:text-red-300">
              What you do with the invoice that pushes you over the limit is
              crucial.
            </p>
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 border-l-4 border-red-600 dark:border-red-400">
              <p className="mb-2 text-card-foreground">
                Let's say your current turnover is NOK 48,000, and you are about
                to issue a new invoice for NOK 5,000.
              </p>
              <p className="font-bold text-red-900 dark:text-red-200">
                That invoice MUST include MVA. The obligation begins with the
                transaction that causes you to exceed the limit.
              </p>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg bg-muted p-4">
                <p className="font-semibold mb-2 text-foreground">
                  Invoice Calculation:
                </p>
                <ul className="space-y-1 text-card-foreground">
                  <li>
                    Invoice Amount: <strong>NOK 5,000</strong>
                  </li>
                  <li>
                    Add 25% MVA: <strong>NOK 1,250</strong>
                  </li>
                  <li className="text-lg font-bold text-green-700 dark:text-green-400">
                    Total Invoice: NOK 6,250
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  ✅ Add a Note to the Invoice
                </p>
                <p className="text-card-foreground mb-2">
                  Since you don't have an MVA number yet, you must add this text
                  to the invoice:
                </p>
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-3 font-mono text-sm text-blue-900 dark:text-blue-100">
                  "Selskapet er under registrering i Merverdiavgiftsregisteret."
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  (English: "The company is undergoing registration in the VAT
                  Register.")
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 border-l-4 border-yellow-600 dark:border-yellow-400">
                <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                  ⚠️ Register Immediately
                </p>
                <p className="text-yellow-800 dark:text-yellow-300">
                  You must submit your registration application to the
                  Brønnøysund Register Centre without delay.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              4. Life as an MVA-Registered Business
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-card-foreground">
              Once your registration is approved, your business operations
              change:
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="text-red-600 dark:text-red-400 font-bold">
                  MUST
                </div>
                <div>
                  <p className="font-semibold text-foreground">Charge MVA:</p>
                  <p className="text-muted-foreground">
                    You must add MVA to all your taxable sales in Norway,
                    regardless of whether your turnover for the year is high or
                    low. The 50k threshold is for registration, not for ongoing
                    operations.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-green-600 dark:text-green-400 font-bold">
                  CAN
                </div>
                <div>
                  <p className="font-semibold text-foreground">Deduct MVA:</p>
                  <p className="text-muted-foreground">
                    You gain the right to deduct the MVA on your business
                    purchases (e.g., tools, software, rent, professional
                    services). This is a significant financial benefit.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-red-600 dark:text-red-400 font-bold">
                  MUST
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    File MVA Returns:
                  </p>
                  <p className="text-muted-foreground">
                    You will need to submit regular MVA returns (usually every
                    two months) to the Tax Administration. This report details
                    the MVA you've collected and the MVA you've paid.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              5. Deregistering from MVA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-card-foreground">
              What if your turnover drops and stays low? You are not stuck in
              the system forever.
            </p>
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold mb-2 text-foreground">
                You can apply to be removed from the MVA Register if your
                turnover has been below the NOK 50,000 threshold for a full
                12-month period.
              </p>
              <ul className="list-disc ml-6 space-y-2 text-card-foreground">
                <li>
                  This is not automatic. You must send an application to the Tax
                  Administration.
                </li>
                <li>
                  <strong>Consequences:</strong> If your application is
                  approved, you must stop charging MVA and you will lose the
                  right to deduct MVA on your expenses.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card>
          <CardHeader>
            <CardTitle>6. Important Concepts Explained</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2 text-foreground">
                Different MVA Rates
              </h3>
              <p className="mb-3 text-card-foreground">
                While 25% is standard, other rates exist:
              </p>
              <ul className="space-y-2 text-card-foreground">
                <li>
                  <strong>15%:</strong> On foodstuffs and beverages.
                </li>
                <li>
                  <strong>12%:</strong> On passenger transport, cinema tickets,
                  and hotel accommodation.
                </li>
                <li>
                  <strong>0% (Zero-rated):</strong> On exports of goods and
                  services, books, and newspapers.
                </li>
              </ul>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-bold text-lg mb-2 text-foreground">
                Reverse Charge (Snudd Regning) - A Common Misconception
              </h3>
              <p className="mb-2 text-card-foreground">
                "Reverse Charge" is a special rule for specific B2B
                (business-to-business) transactions, most commonly in the
                construction industry. It means the buyer, not the seller, is
                responsible for calculating and reporting the MVA.
              </p>
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 border-l-4 border-yellow-600 dark:border-yellow-400">
                <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                  This is NOT a general alternative to charging MVA. You cannot
                  simply decide to use it because your turnover is low or
                  because you are not registered.
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-bold text-lg mb-2 text-foreground">
                Sales Outside Norway (Export)
              </h3>
              <p className="text-card-foreground">
                If you are an MVA-registered business selling services or goods
                to a client outside of Norway, the sale is generally zero-rated
                (0% MVA). You must still report the sale on your MVA return.
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-bold text-lg mb-2 text-foreground">
                Foreign Companies
              </h3>
              <p className="text-card-foreground">
                Companies from within the EEA (EU + Iceland, Liechtenstein),
                like a Polish company, can register for MVA in Norway directly.
                They are not required to have a Norwegian fiscal representative.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Summary Table: Your MVA Status at a Glance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left p-3 font-bold text-foreground">
                      Your Status
                    </th>
                    <th className="text-left p-3 font-bold text-foreground">
                      Do you charge MVA?
                    </th>
                    <th className="text-left p-3 font-bold text-foreground">
                      Can you deduct MVA?
                    </th>
                    <th className="text-left p-3 font-bold text-foreground">
                      Key Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 text-card-foreground">
                      Unregistered & below 50k threshold
                    </td>
                    <td className="p-3 text-red-600 dark:text-red-400 font-semibold">
                      No.
                    </td>
                    <td className="p-3 text-red-600 dark:text-red-400 font-semibold">
                      No.
                    </td>
                    <td className="p-3 text-card-foreground">
                      Monitor your turnover over the last 12 months.
                    </td>
                  </tr>
                  <tr className="border-b border-border bg-orange-50 dark:bg-orange-950/30">
                    <td className="p-3 text-card-foreground">
                      Unregistered & about to cross 50k
                    </td>
                    <td className="p-3 text-green-600 dark:text-green-400 font-semibold">
                      Yes. On the invoice that crosses the limit.
                    </td>
                    <td className="p-3 text-green-600 dark:text-green-400 font-semibold">
                      Yes. You can retroactively claim deductions.
                    </td>
                    <td className="p-3 font-bold text-orange-900 dark:text-orange-300">
                      Register for MVA immediately.
                    </td>
                  </tr>
                  <tr className="border-b border-border bg-green-50 dark:bg-green-950/30">
                    <td className="p-3 text-card-foreground">
                      Registered (any turnover)
                    </td>
                    <td className="p-3 text-green-600 dark:text-green-400 font-semibold">
                      Yes. Mandatory on all taxable sales in Norway.
                    </td>
                    <td className="p-3 text-green-600 dark:text-green-400 font-semibold">
                      Yes. On all business-related expenses.
                    </td>
                    <td className="p-3 text-card-foreground">
                      File MVA returns regularly.
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-card-foreground">Deregistered</td>
                    <td className="p-3 text-red-600 dark:text-red-400 font-semibold">
                      No.
                    </td>
                    <td className="p-3 text-red-600 dark:text-red-400 font-semibold">
                      No.
                    </td>
                    <td className="p-3 text-card-foreground">
                      Monitor turnover in case you need to re-register.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-muted border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground italic">
              <strong>Disclaimer:</strong> This guide provides general
              information about Norwegian MVA rules and is not a substitute for
              professional legal or financial advice. Tax laws are complex and
              can change. We strongly recommend you consult with a certified
              Norwegian accountant (regnskapsfører) or tax advisor to ensure
              your business is fully compliant.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
