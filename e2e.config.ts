import { existsSync } from "node:fs";
import type { E2EConfig } from "e2e";
import { web } from "@e2e-dev/web";
import { gateway } from "ai";

// e2e loads no .env file itself. Variables already set in the shell win.
const envFile = new URL(".env.local", import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);

// Redacted from every report and trace. A secret shorter than 6 characters fails config load,
// so only the ones that are set are registered. Test card numbers are not secrets: once a secret
// is filled, e2e stops taking screenshots, and the vision checks need them.
const secrets: Record<string, string> = {};
if (process.env.STRIPE_SECRET_KEY) secrets["stripe-secret-key"] = process.env.STRIPE_SECRET_KEY;

export default {
  // The Vercel AI Gateway serves the model id and reads AI_GATEWAY_API_KEY, or the OIDC token of a linked Vercel project.
  agents: {
    default: {
      model: gateway("openai/gpt-6-luna-fast"),
      system: "You are a thorough QA agent. Verify every outcome.",
      context:
        "Payment happens on Stripe's own checkout page at checkout.stripe.com; its 3D Secure screens may open in an iframe. All cards are Stripe test cards in a sandbox; nothing is charged.",
    },
  },
  secrets,
  targets: [
    {
      engine: web(),
      app: {
        url: process.env.APP_URL ?? "http://localhost:3000",
        // Or let the runner start the dev server (and reuse one already running on that URL):
        // command: { executable: "npm", args: ["run", "dev"], reuseExisting: true, log: ".e2e/logs/app.log" },
      },
    },
  ],
} satisfies E2EConfig;
