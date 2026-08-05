import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params;
        const { productIds } = await req.json();

        if (!productIds || productIds.length === 0) {
            return new NextResponse("Product ids are required", { status: 400 });
        }

        // Get products from Firestore
        const productsPromises = productIds.map((id: string) =>
            db.collection('stores').doc(storeId).collection('products').doc(id).get()
        );

        const productDocs = await Promise.all(productsPromises);

        const products = productDocs
            .filter(doc => doc.exists)
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

        products.forEach((product: any) => {
            line_items.push({
                quantity: 1,
                price_data: {
                    currency: 'MXN',
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: Math.round(product.price * 100)
                }
            });
        });

        // Create order in Firestore with denormalized product data
        const orderRef = await db
            .collection('stores')
            .doc(storeId)
            .collection('orders')
            .add({
                isPaid: false,
                phone: '',
                address: '',
                items: products.map((product: any) => ({
                    productId: product.id,
                    productName: product.name,
                    productPrice: product.price
                })),
                createdAt: new Date(),
                updatedAt: new Date()
            });

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment',
            billing_address_collection: 'required',
            phone_number_collection: {
                enabled: true,
            },
            success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
            cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
            metadata: {
                orderId: orderRef.id,
                storeId: storeId
            },
        });

        return NextResponse.json({ url: session.url }, {
            headers: corsHeaders
        });
    } catch (error) {
        console.log('[CHECKOUT_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
