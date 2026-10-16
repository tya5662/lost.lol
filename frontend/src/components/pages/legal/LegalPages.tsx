import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type LegalKind = 'terms' | 'policy' | 'refunds';

const legalCopy: Record<LegalKind, { title: string; updated: string; intro: string; sections: { heading: string; body: string }[] }> = {
  terms: {
    title: 'Terms of Service',
    updated: 'October 16, 2026',
    intro: 'These Terms of Service govern your use of suffer.info and its profile, account, and customization features. By using the service, you agree to these terms.',
    sections: [
      { heading: 'Eligibility and accounts', body: 'Provide accurate account information, keep your sign-in credentials secure, and use only accounts you are authorized to access. You are responsible for activity under your account.' },
      { heading: 'Acceptable use', body: 'Do not use the service to break laws, threaten or harass others, distribute malware, attempt unauthorized access, interfere with the service, impersonate others, or post content that violates another person’s rights. We may remove content or restrict accounts that violate these rules.' },
      { heading: 'User content', body: 'You retain responsibility for the text, images, links, audio, and other content you upload or publish. You must have the rights and permissions needed to use that content. You grant us permission to host and display it only as needed to operate the service.' },
      { heading: 'Availability and changes', body: 'We may change, suspend, or discontinue features, including for maintenance, security, or operational reasons. We do not guarantee uninterrupted or error-free availability and may remove content that creates legal, security, or service risks.' },
      { heading: 'Paid features', body: 'Prices, feature limits, and any additional purchase terms shown at checkout apply to paid features. Review the Refund Policy before buying. Nothing in these terms removes consumer rights that cannot legally be waived.' },
      { heading: 'Disclaimer and limits', body: 'The service is provided on an “as available” basis to the extent permitted by law. To the extent permitted by law, we disclaim implied warranties and are not liable for indirect or consequential losses arising from use of the service.' },
      { heading: 'Changes and contact', body: 'We may update these terms by posting a revised version here. Continued use after an update means you accept the revised terms where permitted by law. For support or questions, contact the site operator through the contact method published on suffer.info.' },
    ],
  },
  policy: {
    title: 'Privacy Policy',
    updated: 'October 16, 2026',
    intro: 'This policy explains what information suffer.info may process when you create an account or use the site.',
    sections: [
      { heading: 'Information you provide', body: 'Depending on the features you use, we may process your email address, username, account credentials in protected form, profile text, links, uploaded media, and support messages.' },
      { heading: 'Technical and security information', body: 'We may process IP addresses, device and browser details, access times, and security events to operate the service, prevent abuse, investigate suspicious sign-ins, and protect accounts. Security logs may be retained for as long as reasonably needed for these purposes.' },
      { heading: 'How information is used', body: 'Information may be used to create and maintain accounts, display your public profile, provide requested features, send account-related messages, enforce our rules, troubleshoot issues, and protect the service.' },
      { heading: 'Service providers', body: 'We may use hosting, database, email-delivery, analytics, and security providers to operate suffer.info. Those providers may process information on our behalf to deliver their services.' },
      { heading: 'Public profiles', body: 'Information you choose to publish on your profile may be visible to anyone, including people who do not have an account. Do not publish private information you do not want to make public.' },
      { heading: 'Retention and your choices', body: 'We keep information for as long as needed for the purposes described here, including legal, security, and operational needs. You may contact the site operator to request account or data assistance. Some records may need to be retained where required or permitted by law.' },
      { heading: 'Children and policy updates', body: 'If you believe a child has provided personal information inappropriately, contact the site operator. We may update this policy by publishing a new version on this page.' },
    ],
  },
  refunds: {
    title: 'Refund Policy — No Refunds',
    updated: 'October 16, 2026',
    intro: 'Except where required by applicable law or expressly stated at checkout, all purchases of digital goods, subscriptions, and premium features are final and non-refundable.',
    sections: [
      { heading: 'All sales are final', body: 'Please review the feature description and price carefully before purchasing. We generally do not offer refunds, credits, or exchanges for change of mind, accidental purchases, unused time, or failure to use a purchased feature.' },
      { heading: 'Exceptions required by law', body: 'This policy does not limit any refund, cancellation, or other right that cannot legally be excluded. If a purchase was unauthorized, duplicated, or a paid feature was not provided as described, contact support so the issue can be reviewed.' },
      { heading: 'Subscriptions and renewals', body: 'If a subscription or recurring payment is offered, the checkout page will describe its price and renewal terms. Cancel future renewals using the available account or payment-provider controls; cancellation does not automatically refund a past payment unless required by law or stated at checkout.' },
      { heading: 'How to contact us', body: 'For billing questions, include the account username, purchase date, and transaction reference when contacting the site operator. Do not send full payment-card numbers or passwords.' },
    ],
  },
};

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const kind: LegalKind = location.pathname === '/policy' ? 'policy' : location.pathname === '/refunds' ? 'refunds' : 'terms';
  const page = legalCopy[kind];
  return (
    <main className="min-h-screen bg-[#070707] px-5 py-10 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link to="/" className="text-lg font-black tracking-tight text-white">suffer<span className="text-red-400">.info</span></Link>
          <Link to="/" className="text-sm text-zinc-400 transition hover:text-white">Back to home</Link>
        </header>
        <p className="text-xs font-bold uppercase tracking-[.24em] text-red-300">Legal</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{page.title}</h1>
        <p className="mt-3 text-xs text-zinc-500">Last updated: {page.updated}</p>
        <p className="mt-7 rounded-2xl border border-white/10 bg-white/[.03] p-5 leading-7 text-zinc-300">{page.intro}</p>
        <div className="mt-8 space-y-7">
          {page.sections.map((section) => <section key={section.heading}>
            <h2 className="text-lg font-bold text-white">{section.heading}</h2>
            <p className="mt-2 leading-7 text-zinc-400">{section.body}</p>
          </section>)}
        </div>
        <footer className="mt-12 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-6 text-sm text-zinc-500">
          <Link className="hover:text-white" to="/terms">Terms of Service</Link>
          <Link className="hover:text-white" to="/policy">Privacy Policy</Link>
          <Link className="hover:text-white" to="/refunds">No Refunds</Link>
        </footer>
      </div>
    </main>
  );
};
