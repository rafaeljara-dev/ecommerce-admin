import { format } from "date-fns";

import { db } from "@/lib/firebase";

import { ColorColumn } from "./components/columns";
import { ColorClient } from "./components/client";

const ColorsPage = async ({
    params
}: {
    params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;

    const colorsSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('colors')
        .orderBy('createdAt', 'desc')
        .get();

    const formattedColors: ColorColumn[] = colorsSnapshot.docs.map((doc) => {
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
                <ColorClient data={formattedColors} />
            </div>
        </div>
    );
};

export default ColorsPage;
