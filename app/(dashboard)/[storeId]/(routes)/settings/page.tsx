import { redirect } from "next/navigation";

import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";
import { SettingsForm } from "./components/settings-form";

interface SettingsPageProps {
    params: {
        storeId: string;
    }
}

const SettingsPage: React.FC<SettingsPageProps> = async ({
    params
}) => {
    const { storeId } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const storeDoc = await db.collection('stores').doc(storeId).get();

    if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
        redirect("/");
    }

    const store = {
        id: storeDoc.id,
        ...storeDoc.data()
    };

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SettingsForm initialData={store} />
            </div>
        </div>
    );
};

export default SettingsPage;
