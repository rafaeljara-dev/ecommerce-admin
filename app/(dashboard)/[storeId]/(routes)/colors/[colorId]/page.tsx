import { db } from "@/lib/firebase";

import { ColorForm } from "./components/color-form";

const ColorPage = async ({
    params
}: {
    params: Promise<{ storeId: string; colorId: string }>
}) => {
    const { storeId, colorId } = await params;

    let color = null;

    if (colorId !== 'new') {
        const colorDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('colors')
            .doc(colorId)
            .get();

        if (colorDoc.exists) {
            color = {
                id: colorDoc.id,
                ...colorDoc.data()
            };
        }
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ColorForm initialData={color} />
            </div>
        </div>
    );
};

export default ColorPage;
