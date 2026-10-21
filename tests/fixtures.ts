import { test as base } from "@e2e-dev/web";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
// Sandbox keys contain _test_. A live key fails loudly instead of skipping.
if (key && !key.includes("_test_")) throw new Error("The e2e tests only run against a Stripe sandbox key.");

export const skip = !key
  ? "set STRIPE_SECRET_KEY to run the Stripe tests"
  : !process.env.AI_GATEWAY_API_KEY
    ? "set AI_GATEWAY_API_KEY to run the agent tests"
    : false;

export const test = base.extend<{ stripe: Stripe }>({
  stripe: async ({}, use) => {
    await use(new Stripe(key ?? ""));
  },
});

export const CUSTOMER = { email: "ada@example.com", name: "Ada Lovelace", expiry: "12/34", cvc: "123" };

export const CARDS = {
  visa: "4242 4242 4242 4242",
  declined: "4000 0000 0000 0002",
  // Stripe advises a separate card per scenario.
  threeDSecure: "4000 0027 6000 3184",
  threeDSecureToFail: "4000 0025 0000 3155",
};

// Stripe's page URL: checkout.stripe.com/c/pay/cs_test_…
export function sessionIdFromStripeUrl(url: string): string {
  const id = url.match(/cs_test_[A-Za-z0-9]+/)?.[0];
  if (!id) throw new Error(`No Checkout Session id in ${url}`);
  return id;
}
