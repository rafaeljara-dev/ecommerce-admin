import { format } from "date-fns";

import { db } from "@/lib/firebase";

import { SizeColumn } from "./components/columns";
import { SizesClient } from "./components/client";

const SizesPage = async ({
    params
}: {
    params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;

    const sizesSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('sizes')
        .orderBy('createdAt', 'desc')
        .get();

    const formattedSizes: SizeColumn[] = sizesSnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
        return {
            id: doc.id,
            name: data.name,
            value: data.value,
            createdAt: format(createdAt, 'MMMM do, yyyy'),
        };
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SizesClient data={formattedSizes} />
            </div>
        </div>
    );
};

export default SizesPage;
