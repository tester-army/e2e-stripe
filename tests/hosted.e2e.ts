import { describe } from "@e2e-dev/web";
import { expect } from "e2e";

import { CARDS, CUSTOMER, sessionIdFromStripeUrl, skip, test } from "./fixtures";

const STRIPE_PAGE = /^https:\/\/checkout\.stripe\.com\//;
const FILL_PAYMENT_FORM =
  "fill in the payment form with email {email}, card number {number}, expiry {expiry}, CVC {cvc}, and cardholder name {name}";

// Stripe's checkout isn't built for automation, so these tests retry.
describe("hosted checkout", { tags: ["hosted"], skip, retries: 2, timeout: 180_000 }, () => {
  test("a valid card pays on Stripe's page and Stripe records it", async ({ app, agent, screen, browser, stripe }) => {
    await app.open("/");
    await screen.getByRole("button", "Pay on Stripe").click();
    await expect(browser).toHaveURL(STRIPE_PAGE, { timeout: 15_000 });

    await agent.act(FILL_PAYMENT_FORM, { params: { ...CUSTOMER, number: CARDS.visa } });
    await agent.assert("the card number field shows 4242 4242 4242 4242", { vision: true });

    await agent.act("click the Pay button");
    await expect(screen.getByTestId("payment-status")).toHaveText("Paid", { timeout: 30_000 });

    const sessionId = new URL(await browser.url()).searchParams.get("session_id") ?? "";
    expect(await stripe.checkout.sessions.retrieve(sessionId)).toMatchObject({
      status: "complete",
      payment_status: "paid",
      amount_total: 2000,
    });
  });

  test(
    "a declined card shows Stripe's error and nothing is charged",
    {
      agentContext:
        "The card is a Stripe test card that is always declined, so a decline message after paying is the expected outcome, not a failure.",
    },
    async ({ app, agent, screen, browser, stripe }) => {
      await app.open("/");
      await screen.getByRole("button", "Pay on Stripe").click();
      await expect(browser).toHaveURL(STRIPE_PAGE, { timeout: 15_000 });
      const sessionId = sessionIdFromStripeUrl(await browser.url());

      await agent.act(FILL_PAYMENT_FORM, { params: { ...CUSTOMER, number: CARDS.declined } });
      await agent.assert("the card number field shows 4000 0000 0000 0002", { vision: true });

      await agent.act("click the Pay button");
      await agent.waitFor("the page says the card was declined", { vision: true });
      await expect(browser).toHaveURL(STRIPE_PAGE);
      expect(await stripe.checkout.sessions.retrieve(sessionId)).toMatchObject({
        status: "open",
        payment_status: "unpaid",
      });
    },
  );

  test(
    "3D Secure: completing the challenge pays",
    {
      agentContext:
        "After Pay, Stripe shows a test 3D Secure page with buttons to complete or fail the authentication.",
    },
    async ({ app, agent, screen, browser, stripe }) => {
      await app.open("/");
      await screen.getByRole("button", "Pay on Stripe").click();
      await expect(browser).toHaveURL(STRIPE_PAGE, { timeout: 15_000 });

      await agent.act(FILL_PAYMENT_FORM, { params: { ...CUSTOMER, number: CARDS.threeDSecure } });
      await agent.assert("the card number field shows 4000 0027 6000 3184", { vision: true });

      await agent.act("click the Pay button");
      await agent.waitFor("a 3D Secure authentication challenge is showing", { vision: true });

      await agent.act("complete the authentication");
      await expect(screen.getByTestId("payment-status")).toHaveText("Paid", { timeout: 30_000 });

      const sessionId = new URL(await browser.url()).searchParams.get("session_id") ?? "";
      expect(await stripe.checkout.sessions.retrieve(sessionId)).toMatchObject({
        status: "complete",
        payment_status: "paid",
      });
    },
  );

  test(
    "3D Secure: failing the challenge leaves the order unpaid",
    {
      agentContext:
        "After Pay, Stripe shows a test 3D Secure page with buttons to complete or fail the authentication. Failing it is the goal, so an error afterwards is expected.",
    },
    async ({ app, agent, screen, browser, stripe }) => {
      await app.open("/");
      await screen.getByRole("button", "Pay on Stripe").click();
      await expect(browser).toHaveURL(STRIPE_PAGE, { timeout: 15_000 });
      const sessionId = sessionIdFromStripeUrl(await browser.url());

      await agent.act(FILL_PAYMENT_FORM, { params: { ...CUSTOMER, number: CARDS.threeDSecureToFail } });
      await agent.assert("the card number field shows 4000 0025 0000 3155", { vision: true });

      await agent.act("click the Pay button");
      await agent.waitFor("a 3D Secure authentication challenge is showing", { vision: true });

      await agent.act("fail the authentication");
      await agent.waitFor("the page says the payment could not be authenticated", { vision: true });
      await expect(browser).toHaveURL(STRIPE_PAGE);
      expect(await stripe.checkout.sessions.retrieve(sessionId)).toMatchObject({
        status: "open",
        payment_status: "unpaid",
      });
    },
  );

  test("backing out of Stripe's page returns to the checkout unpaid", async ({
    app,
    agent,
    screen,
    browser,
    stripe,
  }) => {
    await app.open("/");
    await screen.getByRole("button", "Pay on Stripe").click();
    await expect(browser).toHaveURL(STRIPE_PAGE, { timeout: 15_000 });
    const sessionId = sessionIdFromStripeUrl(await browser.url());

    // Stripe's back link goes to cancel_url; the browser's back button would skip it.
    await agent.act("leave Stripe's page with the back link at the top of the page");
    await expect(browser).toHaveURL("/");
    await expect(screen.getByRole("button", "Pay on Stripe")).toBeVisible();
    expect(await stripe.checkout.sessions.retrieve(sessionId)).toMatchObject({
      status: "open",
      payment_status: "unpaid",
    });
  });
});
