import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
    try {
        const { storeId, productId } = await params;

        if (!productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }

        const productDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('products')
            .doc(productId)
            .get();

        if (!productDoc.exists) {
            return new NextResponse("Product not found", { status: 404 });
        }

        const data = productDoc.data();

        return NextResponse.json({
            id: productDoc.id,
            name: data?.name,
            price: data?.price,
            isFeatured: data?.isFeatured,
            isArchived: data?.isArchived,
            images: data?.images || [],
            category: {
                id: data?.categoryId,
                name: data?.categoryName
            },
            size: {
                id: data?.sizeId,
                name: data?.sizeName,
                value: data?.sizeValue
            },
            color: {
                id: data?.colorId,
                name: data?.colorName,
                value: data?.colorValue
            },
            createdAt: data?.createdAt,
            updatedAt: data?.updatedAt
        });
    } catch (error) {
        console.log('[PRODUCT_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
    try {
        const { storeId, productId } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        await db
            .collection('stores')
            .doc(storeId)
            .collection('products')
            .doc(productId)
            .delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log('[PRODUCT_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
    try {
        const { storeId, productId } = await params;
        const user = await getCurrentUser();
        const body = await req.json();

        const { name, price, categoryId, images, colorId, sizeId, isFeatured, isArchived } = body;

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
        }

        if (!productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!images || !images.length) {
            return new NextResponse("Images are required", { status: 400 });
        }

        if (!price) {
            return new NextResponse("Price is required", { status: 400 });
        }

        if (!categoryId) {
            return new NextResponse("Category id is required", { status: 400 });
        }

        if (!colorId) {
            return new NextResponse("Color id is required", { status: 400 });
        }

        if (!sizeId) {
            return new NextResponse("Size id is required", { status: 400 });
        }

        // Verify store ownership
        const storeDoc = await db.collection('stores').doc(storeId).get();

        if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        // Get related data for denormalization
        const [categoryDoc, sizeDoc, colorDoc] = await Promise.all([
            db.collection('stores').doc(storeId).collection('categories').doc(categoryId).get(),
            db.collection('stores').doc(storeId).collection('sizes').doc(sizeId).get(),
            db.collection('stores').doc(storeId).collection('colors').doc(colorId).get()
        ]);

        const categoryData = categoryDoc.data();
        const sizeData = sizeDoc.data();
        const colorData = colorDoc.data();

        await db
            .collection('stores')
            .doc(storeId)
            .collection('products')
            .doc(productId)
            .update({
                name,
                price: Number(price),
                isFeatured: isFeatured || false,
                isArchived: isArchived || false,
                categoryId,
                categoryName: categoryData?.name || '',
                sizeId,
                sizeName: sizeData?.name || '',
                sizeValue: sizeData?.value || '',
                colorId,
                colorName: colorData?.name || '',
                colorValue: colorData?.value || '',
                images: images.map((img: { url: string }) => ({ url: img.url })),
                updatedAt: new Date()
            });

        const updatedProduct = await db
            .collection('stores')
            .doc(storeId)
            .collection('products')
            .doc(productId)
            .get();

        const data = updatedProduct.data();

        return NextResponse.json({
            id: updatedProduct.id,
            name: data?.name,
            price: data?.price,
            isFeatured: data?.isFeatured,
            isArchived: data?.isArchived,
            images: data?.images || [],
            category: {
                id: data?.categoryId,
                name: data?.categoryName
            },
            size: {
                id: data?.sizeId,
                name: data?.sizeName,
                value: data?.sizeValue
            },
            color: {
                id: data?.colorId,
                name: data?.colorName,
                value: data?.colorValue
            },
            createdAt: data?.createdAt,
            updatedAt: data?.updatedAt
        });
    } catch (error) {
        console.log('[PRODUCT_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
