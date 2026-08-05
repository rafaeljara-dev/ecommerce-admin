import { redirect } from "next/navigation";

import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";

export default async function SetupLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const storesSnapshot = await db
        .collection('stores')
        .where('userId', '==', user.userId)
        .limit(1)
        .get();

    if (!storesSnapshot.empty) {
        const store = storesSnapshot.docs[0];
        redirect(`/${store.id}`);
    }

    return (
        <>
            {children}
        </>
    );
}
