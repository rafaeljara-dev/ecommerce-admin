import { db } from "@/lib/firebase";

import { SizeForm } from "./components/size-form";

const SizePage = async ({
    params
}: {
    params: Promise<{ storeId: string; sizeId: string }>
}) => {
    const { storeId, sizeId } = await params;

    let size = null;

    if (sizeId !== 'new') {
        const sizeDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('sizes')
            .doc(sizeId)
            .get();

        if (sizeDoc.exists) {
            size = {
                id: sizeDoc.id,
                ...sizeDoc.data()
            };
        }
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SizeForm initialData={size} />
            </div>
        </div>
    );
};

export default SizePage;
