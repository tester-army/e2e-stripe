import { LightButton } from "@/components/ui/light-button";
import { formatUsd, ITEM } from "@/lib/item";

export default function CheckoutPage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10">
      <div className="mx-auto grid w-full max-w-300 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-20">
        <div>
          <h1 className="type-h1 text-e2e-text-primary">
            Stripe checkout,
            <br />
            tested end to end
          </h1>
          <p className="mt-4 max-w-120 type-body text-e2e-text-secondary">
            A real Stripe payment in a sandbox, tested with e2e: in the browser, and against what Stripe recorded.
          </p>
          <p className="mt-8 type-code-s text-e2e-text-faint">
            Test card 4242 4242 4242 4242, any future expiry, any CVC.
          </p>
        </div>

        <OrderPanel />
      </div>
    </main>
  );
}

function OrderPanel() {
  const total = formatUsd(ITEM.amount);

  return (
    <section
      aria-labelledby="order-heading"
      className="flex flex-col gap-5 border border-e2e-hairline-strong bg-e2e-panel p-5"
    >
      <h2 id="order-heading" className="type-label-xs text-e2e-text-faint">
        Your order
      </h2>
      <dl className="flex flex-col gap-3 type-body-s">
        <div className="flex justify-between gap-4 text-e2e-text-soft">
          <dt>{ITEM.name}</dt>
          <dd>{total}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-e2e-hairline-strong pt-3 font-medium text-e2e-text-bright">
          <dt>Total</dt>
          <dd data-testid="order-total">{total}</dd>
        </div>
      </dl>
      <form action="/checkout" method="post">
        <LightButton type="submit">Pay on Stripe</LightButton>
      </form>
      <p className="type-caption text-e2e-text-faint">You pay on checkout.stripe.com, Stripe&apos;s hosted page.</p>
    </section>
  );
}
