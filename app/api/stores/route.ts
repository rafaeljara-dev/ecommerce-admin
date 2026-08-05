import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const storesSnapshot = await db
            .collection('stores')
            .where('userId', '==', user.userId)
            .orderBy('createdAt', 'desc')
            .get();

        const stores = storesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(stores);

    } catch (error) {
        console.log('[STORES_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        const body = await req.json();

        const { name } = body;

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

        const storeRef = await db.collection('stores').add({
            name,
            slug,
            userId: user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const storeDoc = await storeRef.get();

        return NextResponse.json({
            id: storeDoc.id,
            ...storeDoc.data()
        });

    } catch (error) {
        console.log('[STORES_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
