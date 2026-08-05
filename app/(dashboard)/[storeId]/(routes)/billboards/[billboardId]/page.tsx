import { db } from "@/lib/firebase";
import { BillboardForm } from "./components/billboard-form";

const BillboardPage = async ({
    params
}: {
    params: Promise<{ storeId: string; billboardId: string }>
}) => {
    const { storeId, billboardId } = await params;

    let billboard = null;

    if (billboardId !== 'new') {
        const billboardDoc = await db
            .collection('stores')
            .doc(storeId)
            .collection('billboards')
            .doc(billboardId)
            .get();

        if (billboardDoc.exists) {
            billboard = {
                id: billboardDoc.id,
                ...billboardDoc.data()
            };
        }
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BillboardForm initialData={billboard} />
            </div>
        </div>
    );
};

export default BillboardPage;
