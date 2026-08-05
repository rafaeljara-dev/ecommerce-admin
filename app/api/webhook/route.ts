import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.customer_details?.address;

    const addressComponents = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country
    ];

    const addressString = addressComponents.filter((c) => c !== null).join(', ');

    if (event.type === "checkout.session.completed") {
        const orderId = session?.metadata?.orderId;
        const storeId = session?.metadata?.storeId;

        if (!orderId || !storeId) {
            return new NextResponse("Missing metadata", { status: 400 });
        }

        // Update order as paid
        const orderRef = db
            .collection('stores')
            .doc(storeId)
            .collection('orders')
            .doc(orderId);

        const orderDoc = await orderRef.get();
        const orderData = orderDoc.data();

        await orderRef.update({
            isPaid: true,
            address: addressString,
            phone: session?.customer_details?.phone || '',
            updatedAt: new Date()
        });

        // Archive purchased products
        if (orderData?.items) {
            const batch = db.batch();

            for (const item of orderData.items) {
                const productRef = db
                    .collection('stores')
                    .doc(storeId)
                    .collection('products')
                    .doc(item.productId);

                batch.update(productRef, {
                    isArchived: true,
                    updatedAt: new Date()
                });
            }

            await batch.commit();
        }
    }

    return new NextResponse(null, { status: 200 });
}
