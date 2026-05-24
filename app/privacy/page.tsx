import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How this site handles cookies, third-party advertising, and personal data.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-sm dark:prose-invert mx-auto max-w-3xl py-6">
      <h1>Privacy policy</h1>
      <p className="text-muted-foreground">Last updated: 9 May 2026</p>

      <h2>Who runs this site</h2>
      <p>
        This site is run by an individual operator based in the Netherlands (referred
        to below as "the operator"). For privacy questions, contact{" "}
        <a href="mailto:financial-instruments@proton.me">financial-instruments@proton.me</a>.
      </p>

      <h2>What data we collect directly</h2>
      <p>
        None. The calculator runs entirely in your browser. There is no sign-up, no
        contact form, and no comment system. The numbers you enter are encoded into
        the URL so you can share a scenario; that URL is not transmitted to any
        server controlled by the operator.
      </p>

      <h2>Cookies and third-party advertising</h2>
      <p>
        This site uses Google AdSense to serve advertisements. Google and its partners
        may set cookies in your browser to deliver ads, including personalised ads
        based on your visits to this and other sites. Google's use of advertising
        cookies and your opt-out options are described at{" "}
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">
          policies.google.com/technologies/ads
        </a>{" "}
        and{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">
          google.com/settings/ads
        </a>
        . You can also opt out of personalised advertising by third-party vendors at{" "}
        <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener">
          aboutads.info/choices
        </a>{" "}
        and{" "}
        <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener">
          youronlinechoices.eu
        </a>
        .
      </p>

      <h2>Analytics</h2>
      <p>
        This site does not use first-party analytics: no Google Analytics, no
        Plausible, no behavioural fingerprinting. Standard server logs at the hosting
        provider may briefly record IP addresses for abuse prevention.
      </p>

      <h2>Your rights under the GDPR</h2>
      <p>
        If you are in the European Economic Area you have the right to access,
        rectify, erase, restrict, and object to processing of your personal data, and
        to data portability. Because this site collects no personal data directly,
        most of these rights apply to advertising cookies set by Google; manage them
        via the links above. For complaints in the Netherlands, contact the
        Autoriteit Persoonsgegevens (
        <a href="https://autoriteitpersoonsgegevens.nl/" target="_blank" rel="noopener">
          autoriteitpersoonsgegevens.nl
        </a>
        ).
      </p>

      <h2>Children</h2>
      <p>
        This site is not directed at children under 16 and does not knowingly collect
        their data.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        Material changes are reflected by updating the "Last updated" date above.
      </p>

      <p>
        See also the <Link href="/terms">Terms</Link>.
      </p>
    </article>
  );
}
