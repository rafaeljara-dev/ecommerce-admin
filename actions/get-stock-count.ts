import { db } from "@/lib/firebase";

export const getStockCount = async (storeId: string) => {
    const productsSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('products')
        .where('isArchived', '==', false)
        .get();

    return productsSnapshot.size;
};
