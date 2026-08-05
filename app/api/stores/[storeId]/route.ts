import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params;
        const user = await getCurrentUser();
        const body = await req.json();

        const { name } = body;

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        await db.collection('stores').doc(storeId).update({
            name,
            updatedAt: new Date()
        });

        const updatedStore = await db.collection('stores').doc(storeId).get();

        return NextResponse.json({
            id: updatedStore.id,
            ...updatedStore.data()
        });

    } catch (error) {
        console.log('[STORE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // Delete all subcollections first
        const subcollections = ['billboards', 'categories', 'sizes', 'colors', 'products', 'orders'];

        for (const subcollection of subcollections) {
            const snapshot = await db.collection('stores').doc(storeId).collection(subcollection).get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        // Delete the store
        await db.collection('stores').doc(storeId).delete();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.log('[STORE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
