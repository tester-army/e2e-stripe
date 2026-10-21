import "server-only";
import Stripe from "stripe";

let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  // Sandbox keys contain _test_; live keys never do.
  if (!key.includes("_test_")) {
    throw new Error("Set STRIPE_SECRET_KEY to a Stripe sandbox secret key (sk_test_…) in .env.local.");
  }
  stripe ??= new Stripe(key);
  return stripe;
}
