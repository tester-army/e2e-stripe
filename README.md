# e2e-stripe

Real Stripe payments in a sandbox, tested end to end with [e2e](https://www.npmjs.com/package/e2e).

The checkout is Stripe's **hosted page**, the flow Stripe recommends: the shopper leaves for `checkout.stripe.com`, pays, and comes back. The server needs only Stripe's Node SDK; there is no Stripe.js on our pages.

## Getting started

### Stripe key

Everything runs in a free Stripe sandbox: no real money, no business verification. The app needs only the sandbox's secret key.

- **With a Stripe account:** create a sandbox at [dashboard.stripe.com/sandboxes](https://dashboard.stripe.com/sandboxes), then copy its secret key (`sk_test_…`) from [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys).
- **Without an account:** create an anonymous sandbox with the [Stripe CLI](https://docs.stripe.com/stripe-cli) while logged out. It prints a secret key (`rkcs_test_…`). The sandbox expires after 7 days unless you claim it with `stripe sandbox claim`.

  ```bash
  stripe sandbox create --from-git
  ```

### Run

```bash
cp .env.example .env.local   # then add your keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## End-to-end tests

The agent model goes through the Vercel AI Gateway, so set `AI_GATEWAY_API_KEY` in `.env.local` (or link a Vercel project). Then, with the dev server running:

```bash
npm run test:e2e
```

The tests in `tests/home.e2e.ts` use locators only and need no keys.

To test a different URL, set `APP_URL`. Configuration lives in `e2e.config.ts`, which loads `.env.local` because the runner reads no `.env` file by itself.

## Scripts

| Command            | Description          |
| ------------------ | -------------------- |
| `npm run dev`      | Start the dev server |
| `npm run build`    | Build for production |
| `npm run lint`     | Run ESLint           |
| `npm run format`   | Format with Prettier |
| `npm run test:e2e` | Run the e2e tests    |
