import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import Stripe from "stripe";

import { formatUsd } from "@/lib/item";
import { getStripe } from "@/lib/stripe";

export default function ReturnPage({ searchParams }: PageProps<"/return">) {
  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10">
      <div className="mx-auto flex w-full max-w-105 flex-col gap-4">
        <Suspense fallback={<ResultPanel status="Checking…" detail="Asking Stripe about this payment." />}>
          <PaymentResult searchParams={searchParams} />
        </Suspense>
        <Link
          href="/"
          className="inline-flex h-10 w-full items-center justify-center bg-e2e-button-fill px-5 type-button-s text-e2e-text-soft inset-ring-[0.5px] inset-ring-e2e-button-stroke transition-[color,box-shadow] hover:text-e2e-text-bright hover:inset-ring-e2e-paper-0 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-e2e-white-60 motion-reduce:transition-none"
        >
          Back to checkout
        </Link>
      </div>
    </main>
  );
}

async function PaymentResult({ searchParams }: Pick<PageProps<"/return">, "searchParams">) {
  const { session_id: sessionId } = await searchParams;
  if (typeof sessionId !== "string") {
    return <ResultPanel status="No payment" detail="Stripe sends you here after you pay." />;
  }

  // Prerendering can resolve searchParams; Stripe must only be asked per request.
  await connection();
  const session = await retrieveSession(sessionId);
  if (!session) {
    return <ResultPanel status="Not found" detail="Stripe has no checkout session with this id." />;
  }

  if (session.payment_status !== "paid") {
    return <ResultPanel status="Not paid" detail="Stripe has no payment for this checkout." />;
  }

  const email = session.customer_details?.email;
  const amount = formatUsd(session.amount_total ?? 0);
  return <ResultPanel status="Paid" detail={email ? `${amount} paid by ${email}.` : `${amount} paid.`} />;
}

async function retrieveSession(id: string): Promise<Stripe.Checkout.Session | null> {
  try {
    return await getStripe().checkout.sessions.retrieve(id);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) return null;
    throw error;
  }
}

function ResultPanel({ status, detail }: { status: string; detail: string }) {
  return (
    <section
      aria-labelledby="result-heading"
      className="flex flex-col gap-2 border border-e2e-hairline-strong bg-e2e-panel p-5"
    >
      <h1 id="result-heading" className="type-label-xs text-e2e-text-faint">
        Payment
      </h1>
      <p data-testid="payment-status" className="type-h3-display text-e2e-text-bright">
        {status}
      </p>
      <p className="type-body-s text-e2e-text-soft">{detail}</p>
    </section>
  );
}
