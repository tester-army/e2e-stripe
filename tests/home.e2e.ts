import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("the checkout shows the order total and the Pay on Stripe button", async ({ app, screen }) => {
  await app.open("/");

  await expect(screen.getByRole("heading", "Stripe checkout, tested end to end")).toBeVisible();
  await expect(screen.getByTestId("order-total")).toHaveText("$20.00");
  await expect(screen.getByRole("button", "Pay on Stripe")).toBeVisible();
});
