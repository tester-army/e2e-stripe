import { ITEM } from "@/lib/item";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      { quantity: 1, price_data: { currency: "usd", unit_amount: ITEM.amount, product_data: { name: ITEM.name } } },
    ],
    allowed_payment_method_types: ["card"],
    // Link would ask for an email or an SMS code before the card form.
    wallet_options: { link: { display: "never" } },
    success_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
  });

  // 303 so the browser follows with a GET; Next's redirect() is a 307 and would re-send the POST.
  return Response.redirect(session.url!, 303);
}
