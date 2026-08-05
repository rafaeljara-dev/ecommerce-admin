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

        const colorRef = await db
            .collection('stores')
            .doc(storeId)
            .collection('colors')
            .add({
                name,
                value,
                createdAt: new Date(),
                updatedAt: new Date()
            });

        const colorDoc = await colorRef.get();

        return NextResponse.json({
            id: colorDoc.id,
            ...colorDoc.data()
        });
    } catch (error) {
        console.log('[COLORS_POST]', error);
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

        const colorsSnapshot = await db
            .collection('stores')
            .doc(storeId)
            .collection('colors')
            .orderBy('createdAt', 'desc')
            .get();

        const colors = colorsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(colors);
    } catch (error) {
        console.log('[COLORS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
