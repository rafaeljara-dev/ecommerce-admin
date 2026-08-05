import { db } from "@/lib/firebase";

import { ProductForm } from "./components/product-form";

const ProductPage = async ({
    params
}: {
    params: Promise<{ productId: string; storeId: string }>
}) => {
    const { storeId, productId } = await params;

    let product = null;

    if (productId !== 'new') {
        const productDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('products')
            .doc(productId)
            .get();

        if (productDoc.exists) {
            const data = productDoc.data();
            product = {
                id: productDoc.id,
                name: data?.name,
                price: data?.price,
                isFeatured: data?.isFeatured,
                isArchived: data?.isArchived,
                categoryId: data?.categoryId,
                sizeId: data?.sizeId,
                colorId: data?.colorId,
                images: data?.images || []
            };
        }
    }

    // Get categories
    const categoriesSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('categories')
        .orderBy('createdAt', 'desc')
        .get();

    const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Get sizes
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

    // Get colors
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

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductForm
                    categories={categories}
                    colors={colors}
                    sizes={sizes}
                    initialData={product}
                />
            </div>
        </div>
    );
};

export default ProductPage;
