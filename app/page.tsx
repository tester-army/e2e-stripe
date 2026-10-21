import Link from "next/link";

type Flow = {
  href: string;
  name: string;
  eyebrow: string;
  description: string;
  uiMode: string;
};

const FLOWS: Flow[] = [
  {
    href: "/hosted",
    name: "Hosted page",
    eyebrow: "Recommended by Stripe",
    description: "The shopper leaves for checkout.stripe.com, pays, and comes back.",
    uiMode: "hosted_page",
  },
];

export default function HomePage() {
  return (
    // Centered in the space under the header, so the page only scrolls when the content doesn't fit.
    <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 className="type-h1 text-e2e-text-primary">
          Stripe checkout,
          <br />
          tested end to end
        </h1>
        <p className="mt-4 max-w-[560px] type-body text-e2e-text-secondary">
          A real Stripe payment in a sandbox, tested end to end with e2e: in the browser, and against what Stripe
          recorded.
        </p>

        <ul className="mt-14 grid gap-px p-px md:grid-cols-3">
          {FLOWS.map((flow, index) => (
            <FlowCard key={flow.href} flow={flow} index={index + 1} />
          ))}
        </ul>

        <p className="mt-6 type-code-s text-e2e-text-faint">
          Runs in a Stripe sandbox. Pay with 4242 4242 4242 4242, any future expiry, any CVC.
        </p>
      </div>
    </main>
  );
}

// The e2e landing's testimonial card: hairline outline, square corners, a quiet hover fill.
function FlowCard({ flow, index }: { flow: Flow; index: number }) {
  const titleId = `flow-${flow.uiMode}-title`;
  const descriptionId = `flow-${flow.uiMode}-description`;

  return (
    <li className="flex bg-e2e-canvas outline outline-e2e-white-10">
      <Link
        href={flow.href}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="group flex w-full flex-col gap-10 p-6 transition-colors duration-200 outline-none hover:bg-e2e-panel focus-visible:bg-e2e-panel focus-visible:inset-ring-1 focus-visible:inset-ring-e2e-white-60 motion-reduce:transition-none md:p-8"
      >
        <span className="type-eyebrow text-e2e-text-faint">
          [{String(index).padStart(2, "0")}] {flow.eyebrow}
        </span>
        <span className="flex flex-col gap-3">
          <span id={titleId} className="type-feature-title text-e2e-text-bright">
            {flow.name}
          </span>
          <span id={descriptionId} className="type-body-xs text-e2e-text-dim">
            {flow.description}
          </span>
        </span>
        <span className="mt-auto flex items-center justify-between type-chip text-e2e-text-faint">
          <code>ui_mode: {flow.uiMode}</code>
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          >
            →
          </span>
        </span>
      </Link>
    </li>
  );
}
