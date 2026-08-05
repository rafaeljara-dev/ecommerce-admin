import { format } from "date-fns";

import { db } from "@/lib/firebase";
import { formatter } from "@/lib/utils";

import { ProductsClient } from "./components/client";
import { ProductColumn } from "./components/columns";

const ProductsPage = async ({
    params
}: {
    params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;

    const productsSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('products')
        .orderBy('createdAt', 'desc')
        .get();

    const formattedProducts: ProductColumn[] = productsSnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
        return {
            id: doc.id,
            name: data.name,
            isFeatured: data.isFeatured || false,
            isArchived: data.isArchived || false,
            price: formatter.format(Number(data.price)),
            category: data.categoryName || '',
            size: data.sizeName || '',
            color: data.colorValue || '',
            createdAt: format(createdAt, 'MMMM do, yyyy'),
        };
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductsClient data={formattedProducts} />
            </div>
        </div>
    );
};

export default ProductsPage;
