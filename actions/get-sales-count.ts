import { db } from "@/lib/firebase";

export const getSalesCount = async (storeId: string) => {
    const ordersSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('orders')
        .where('isPaid', '==', true)
        .get();

    return ordersSnapshot.size;
};
