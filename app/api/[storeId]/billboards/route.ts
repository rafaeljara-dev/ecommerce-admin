import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params;
        const user = await getCurrentUser();
        const body = await req.json();

        const { label, imageUrl } = body;

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!label) {
            return new NextResponse("Label is required", { status: 400 });
        }

        if (!imageUrl) {
            return new NextResponse("Image URL is required", { status: 400 });
        }

        if (!storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        const billboardRef = await db
            .collection('stores')
            .doc(storeId)
            .collection('billboards')
            .add({
                label,
                imageUrl,
                createdAt: new Date(),
                updatedAt: new Date()
            });

        const billboardDoc = await billboardRef.get();

        return NextResponse.json({
            id: billboardDoc.id,
            ...billboardDoc.data()
        });
    } catch (error) {
        console.log('[BILLBOARDS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params;

        if (!storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const billboardsSnapshot = await db
            .collection('stores')
            .doc(storeId)
            .collection('billboards')
            .orderBy('createdAt', 'desc')
            .get();

        const billboards = billboardsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(billboards);
    } catch (error) {
        console.log('[BILLBOARDS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
