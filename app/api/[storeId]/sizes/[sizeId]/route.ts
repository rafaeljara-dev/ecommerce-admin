import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string; sizeId: string }> }
) {
    try {
        const { storeId, sizeId } = await params;

        if (!sizeId) {
            return new NextResponse("Size id is required", { status: 400 });
        }

        const sizeDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('sizes')
            .doc(sizeId)
            .get();

        if (!sizeDoc.exists) {
            return new NextResponse("Size not found", { status: 404 });
        }

        return NextResponse.json({
            id: sizeDoc.id,
            ...sizeDoc.data()
        });
    } catch (error) {
        console.log('[SIZE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ storeId: string; sizeId: string }> }
) {
    try {
        const { storeId, sizeId } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!sizeId) {
            return new NextResponse("Size id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        await db
            .collection('stores')
            .doc(storeId)
            .collection('sizes')
            .doc(sizeId)
            .delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log('[SIZE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ storeId: string; sizeId: string }> }
) {
    try {
        const { storeId, sizeId } = await params;
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

        if (!sizeId) {
            return new NextResponse("Size id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        await db
            .collection('stores')
            .doc(storeId)
            .collection('sizes')
            .doc(sizeId)
            .update({
                name,
                value,
                updatedAt: new Date()
            });

        const updatedSize = await db
            .collection('stores')
            .doc(storeId)
            .collection('sizes')
            .doc(sizeId)
            .get();

        return NextResponse.json({
            id: updatedSize.id,
            ...updatedSize.data()
        });
    } catch (error) {
        console.log('[SIZE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
