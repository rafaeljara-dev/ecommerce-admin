import { format } from "date-fns";

import { db } from "@/lib/firebase";

import { CategoryColumn } from "./components/columns";
import { CategoriesClient } from "./components/client";

const CategoriesPage = async ({
    params
}: {
    params: Promise<{ storeId: string }>
}) => {
    const { storeId } = await params;

    const categoriesSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('categories')
        .orderBy('createdAt', 'desc')
        .get();

    const formattedCategories: CategoryColumn[] = categoriesSnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
        return {
            id: doc.id,
            name: data.name,
            billboardLabel: data.billboardLabel || '',
            createdAt: format(createdAt, 'MMMM do, yyyy'),
        };
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CategoriesClient data={formattedCategories} />
            </div>
        </div>
    );
};

export default CategoriesPage;
