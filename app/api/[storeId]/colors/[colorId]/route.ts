import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string; colorId: string }> }
) {
    try {
        const { storeId, colorId } = await params;

        if (!colorId) {
            return new NextResponse("Color id is required", { status: 400 });
        }

        const colorDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('colors')
            .doc(colorId)
            .get();

        if (!colorDoc.exists) {
            return new NextResponse("Color not found", { status: 404 });
        }

        return NextResponse.json({
            id: colorDoc.id,
            ...colorDoc.data()
        });
    } catch (error) {
        console.log('[COLOR_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ storeId: string; colorId: string }> }
) {
    try {
        const { storeId, colorId } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!colorId) {
            return new NextResponse("Color id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        await db
            .collection('stores')
            .doc(storeId)
            .collection('colors')
            .doc(colorId)
            .delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log('[COLOR_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ storeId: string; colorId: string }> }
) {
    try {
        const { storeId, colorId } = await params;
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

        if (!colorId) {
            return new NextResponse("Color id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        await db
            .collection('stores')
            .doc(storeId)
            .collection('colors')
            .doc(colorId)
            .update({
                name,
                value,
                updatedAt: new Date()
            });

        const updatedColor = await db
            .collection('stores')
            .doc(storeId)
            .collection('colors')
            .doc(colorId)
            .get();

        return NextResponse.json({
            id: updatedColor.id,
            ...updatedColor.data()
        });
    } catch (error) {
        console.log('[COLOR_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
