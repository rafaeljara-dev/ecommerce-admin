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

        const { name, billboardId } = body;

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!billboardId) {
            return new NextResponse("Billboard ID is required", { status: 400 });
        }

        if (!storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        // Get billboard data for denormalization
        const billboardDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('billboards')
            .doc(billboardId)
            .get();

        const billboardData = billboardDoc.data();

        const categoryRef = await db
            .collection('stores')
            .doc(storeId)
            .collection('categories')
            .add({
                name,
                billboardId,
                billboardLabel: billboardData?.label || '',
                billboardImageUrl: billboardData?.imageUrl || '',
                createdAt: new Date(),
                updatedAt: new Date()
            });

        const categoryDoc = await categoryRef.get();

        return NextResponse.json({
            id: categoryDoc.id,
            ...categoryDoc.data()
        });
    } catch (error) {
        console.log('[CATEGORIES_POST]', error);
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

        const categoriesSnapshot = await db
            .collection('stores')
            .doc(storeId)
            .collection('categories')
            .orderBy('createdAt', 'desc')
            .get();

        const categories = categoriesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                billboardId: data.billboardId,
                billboard: {
                    id: data.billboardId,
                    label: data.billboardLabel,
                    imageUrl: data.billboardImageUrl
                },
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            };
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.log('[CATEGORIES_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
