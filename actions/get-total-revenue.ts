import { db } from "@/lib/firebase";

export const getTotalRevenue = async (storeId: string) => {
    const ordersSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('orders')
        .where('isPaid', '==', true)
        .get();

    const totalRevenue = ordersSnapshot.docs.reduce((total, doc) => {
        const orderData = doc.data();
        const orderTotal = (orderData.items || []).reduce((sum: number, item: any) => {
            return sum + (Number(item.productPrice) || 0);
        }, 0);
        return total + orderTotal;
    }, 0);

    return totalRevenue;
};
