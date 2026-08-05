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

        const { name, price, categoryId, colorId, sizeId, images, isFeatured, isArchived } = body;

        if (!user) {
            return new NextResponse("Unauthenticated", { status: 403 });
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

        if (!storeId) {
            return new NextResponse("Store id is required", { status: 400 });
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

        const productRef = await db
            .collection('stores')
            .doc(storeId)
            .collection('products')
            .add({
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
                createdAt: new Date(),
                updatedAt: new Date()
            });

        const productDoc = await productRef.get();
        const productData = productDoc.data();

        return NextResponse.json({
            id: productDoc.id,
            ...productData,
            category: {
                id: categoryId,
                name: categoryData?.name
            },
            size: {
                id: sizeId,
                name: sizeData?.name,
                value: sizeData?.value
            },
            color: {
                id: colorId,
                name: colorData?.name,
                value: colorData?.value
            }
        });
    } catch (error) {
        console.log('[PRODUCTS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params;
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId') || undefined;
        const colorId = searchParams.get('colorId') || undefined;
        const sizeId = searchParams.get('sizeId') || undefined;
        const isFeatured = searchParams.get('isFeatured');

        if (!storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        let query: FirebaseFirestore.Query = db
            .collection('stores')
            .doc(storeId)
            .collection('products')
            .where('isArchived', '==', false);

        if (categoryId) {
            query = query.where('categoryId', '==', categoryId);
        }

        if (colorId) {
            query = query.where('colorId', '==', colorId);
        }

        if (sizeId) {
            query = query.where('sizeId', '==', sizeId);
        }

        if (isFeatured) {
            query = query.where('isFeatured', '==', true);
        }

        const productsSnapshot = await query.orderBy('createdAt', 'desc').get();

        const products = productsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                price: data.price,
                isFeatured: data.isFeatured,
                isArchived: data.isArchived,
                images: data.images || [],
                category: {
                    id: data.categoryId,
                    name: data.categoryName
                },
                size: {
                    id: data.sizeId,
                    name: data.sizeName,
                    value: data.sizeValue
                },
                color: {
                    id: data.colorId,
                    name: data.colorName,
                    value: data.colorValue
                },
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            };
        });

        return NextResponse.json(products);
    } catch (error) {
        console.log('[PRODUCTS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
