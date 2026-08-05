import { format } from "date-fns";

import { db } from "@/lib/firebase";
import { formatter } from "@/lib/utils";

import { OrderColumn } from "./components/columns";
import { OrderClient } from "./components/client";

const OrdersPage = async ({
    params
}: {
    params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;

    const ordersSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('orders')
        .orderBy('createdAt', 'desc')
        .get();

    const formattedOrders: OrderColumn[] = ordersSnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
        const items = data.items || [];

        return {
            id: doc.id,
            phone: data.phone || '',
            address: data.address || '',
            products: items.map((item: any) => item.productName).join(', '),
            totalPrice: formatter.format(
                items.reduce((total: number, item: any) => total + Number(item.productPrice || 0), 0)
            ),
            isPaid: data.isPaid || false,
            createdAt: format(createdAt, 'MMMM do, yyyy'),
        };
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <OrderClient data={formattedOrders} />
            </div>
        </div>
    );
};

export default OrdersPage;
