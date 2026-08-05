import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
    try {
        const { storeId, billboardId } = await params;

        if (!billboardId) {
            return new NextResponse("Billboard id is required", { status: 400 });
        }

        const billboardDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('billboards')
            .doc(billboardId)
            .get();

        if (!billboardDoc.exists) {
            return new NextResponse("Billboard not found", { status: 404 });
        }

        return NextResponse.json({
            id: billboardDoc.id,
            ...billboardDoc.data()
        });
    } catch (error) {
        console.log('[BILLBOARD_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
    try {
        const { storeId, billboardId } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!billboardId) {
            return new NextResponse("Billboard id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        await db
            .collection('stores')
            .doc(storeId)
            .collection('billboards')
            .doc(billboardId)
            .delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log('[BILLBOARD_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
    try {
        const { storeId, billboardId } = await params;
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

        if (!billboardId) {
            return new NextResponse("Billboard id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        await db
            .collection('stores')
            .doc(storeId)
            .collection('billboards')
            .doc(billboardId)
            .update({
                label,
                imageUrl,
                updatedAt: new Date()
            });

        const updatedBillboard = await db
            .collection('stores')
            .doc(storeId)
            .collection('billboards')
            .doc(billboardId)
            .get();

        return NextResponse.json({
            id: updatedBillboard.id,
            ...updatedBillboard.data()
        });
    } catch (error) {
        console.log('[BILLBOARD_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
