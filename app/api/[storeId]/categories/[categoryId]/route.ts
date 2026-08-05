import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string; categoryId: string }> }
) {
    try {
        const { storeId, categoryId } = await params;

        if (!categoryId) {
            return new NextResponse("Category id is required", { status: 400 });
        }

        const categoryDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('categories')
            .doc(categoryId)
            .get();

        if (!categoryDoc.exists) {
            return new NextResponse("Category not found", { status: 404 });
        }

        const data = categoryDoc.data();

        return NextResponse.json({
            id: categoryDoc.id,
            name: data?.name,
            billboardId: data?.billboardId,
            billboard: {
                id: data?.billboardId,
                label: data?.billboardLabel,
                imageUrl: data?.billboardImageUrl
            },
            createdAt: data?.createdAt,
            updatedAt: data?.updatedAt
        });
    } catch (error) {
        console.log('[CATEGORY_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ storeId: string; categoryId: string }> }
) {
    try {
        const { storeId, categoryId } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!categoryId) {
            return new NextResponse("Category id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        await db
            .collection('stores')
            .doc(storeId)
            .collection('categories')
            .doc(categoryId)
            .delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log('[CATEGORY_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ storeId: string; categoryId: string }> }
) {
    try {
        const { storeId, categoryId } = await params;
        const user = await getCurrentUser();
        const body = await req.json();

        const { name, billboardId } = body;

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!billboardId) {
            return new NextResponse("Billboard ID is required", { status: 400 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!categoryId) {
            return new NextResponse("Category id is required", { status: 400 });
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

        await db
            .collection('stores')
            .doc(storeId)
            .collection('categories')
            .doc(categoryId)
            .update({
                name,
                billboardId,
                billboardLabel: billboardData?.label || '',
                billboardImageUrl: billboardData?.imageUrl || '',
                updatedAt: new Date()
            });

        const updatedCategory = await db
            .collection('stores')
            .doc(storeId)
            .collection('categories')
            .doc(categoryId)
            .get();

        const data = updatedCategory.data();

        return NextResponse.json({
            id: updatedCategory.id,
            name: data?.name,
            billboardId: data?.billboardId,
            billboard: {
                id: data?.billboardId,
                label: data?.billboardLabel,
                imageUrl: data?.billboardImageUrl
            },
            createdAt: data?.createdAt,
            updatedAt: data?.updatedAt
        });
    } catch (error) {
        console.log('[CATEGORY_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
