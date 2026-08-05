import { format } from "date-fns";

import { db } from "@/lib/firebase";

import { BillboardColumn } from "./components/columns";
import { BillboardClient } from "./components/client";

const BillboardsPage = async ({
    params
}: {
    params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;

    const billboardsSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('billboards')
        .orderBy('createdAt', 'desc')
        .get();

    const formattedBillboards: BillboardColumn[] = billboardsSnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
        return {
            id: doc.id,
            label: data.label,
            createdAt: format(createdAt, 'MMMM do, yyyy'),
        };
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <BillboardClient data={formattedBillboards} />
        </div>
    );
};

export default BillboardsPage;
