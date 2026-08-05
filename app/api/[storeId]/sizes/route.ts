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

        const { name, value } = body;

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!value) {
            return new NextResponse("Value is required", { status: 400 });
        }

        if (!storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        const sizeRef = await db
            .collection('stores')
            .doc(storeId)
            .collection('sizes')
            .add({
                name,
                value,
                createdAt: new Date(),
                updatedAt: new Date()
            });

        const sizeDoc = await sizeRef.get();

        return NextResponse.json({
            id: sizeDoc.id,
            ...sizeDoc.data()
        });
    } catch (error) {
        console.log('[SIZES_POST]', error);
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

        const sizesSnapshot = await db
            .collection('stores')
            .doc(storeId)
            .collection('sizes')
            .orderBy('createdAt', 'desc')
            .get();

        const sizes = sizesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(sizes);
    } catch (error) {
        console.log('[SIZES_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
