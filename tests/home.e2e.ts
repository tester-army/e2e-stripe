import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Locators only: this test needs no model and no Stripe key.

test("the home page links to the hosted checkout", async ({ app, screen }) => {
  await app.open("/");

  await expect(screen.getByRole("heading", "Stripe checkout, tested end to end")).toBeVisible();
  await expect(screen.getByRole("link", "Hosted page")).toHaveAttribute("href", "/hosted");
});
