import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms governing use of this site as an educational tool.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-sm dark:prose-invert mx-auto max-w-3xl py-6">
      <h1>Terms of use</h1>
      <p className="text-muted-foreground">Last updated: 9 May 2026</p>

      <h2>Educational purpose</h2>
      <p>
        This site is an educational tool for comparing the financial outcome of
        renting versus buying a home under user-supplied assumptions. It is{" "}
        <strong>not financial, tax, legal, or investment advice</strong>, and it is
        no substitute for consultation with a licensed professional in your
        jurisdiction.
      </p>

      <h2>Accuracy</h2>
      <p>
        The calculator implements simplified versions of US, Dutch, and Italian tax
        rules. Tax parameters reflect rules in force at the time of writing and may
        change. The operator does not guarantee that any number returned by the
        calculator is correct, current, or applicable to your specific situation.
        Cross-check with a qualified advisor before making any financial decision.
      </p>

      <h2>"As is": no warranty</h2>
      <p>
        The site is provided "as is" without warranty of any kind, express or
        implied, including warranties of merchantability, fitness for a particular
        purpose, accuracy, or non-infringement.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, the operator is not liable for any
        direct, indirect, incidental, consequential, or punitive damages arising from
        your use of, or inability to use, this site, including any decision made on
        the basis of its output.
      </p>

      <h2>Third-party content</h2>
      <p>
        This site displays advertisements served by Google AdSense and may link to
        third-party websites. The operator does not control, endorse, or accept
        responsibility for third-party content.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the Netherlands. Any dispute will be
        submitted to the competent court in the Netherlands, without prejudice to
        consumer protection rights you have under mandatory local law.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated. The "Last updated" date above reflects the most
        recent change.
      </p>

      <h2>Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:financial-instruments@proton.me">financial-instruments@proton.me</a>.
      </p>

      <p>
        See also the <Link href="/privacy">Privacy policy</Link>.
      </p>
    </article>
  );
}
