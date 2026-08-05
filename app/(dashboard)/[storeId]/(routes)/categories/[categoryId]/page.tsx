import { db } from "@/lib/firebase";

import { CategoryForm } from "./components/category-form";

const CategoryPage = async ({
    params
}: {
    params: Promise<{ categoryId: string; storeId: string }>
}) => {
    const { storeId, categoryId } = await params;

    let category = null;

    if (categoryId !== 'new') {
        const categoryDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('categories')
            .doc(categoryId)
            .get();

        if (categoryDoc.exists) {
            category = {
                id: categoryDoc.id,
                ...categoryDoc.data()
            };
        }
    }

    const billboardsSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('billboards')
        .orderBy('createdAt', 'desc')
        .get();

    const billboards = billboardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CategoryForm billboards={billboards} initialData={category} />
            </div>
        </div>
    );
};

export default CategoryPage;
