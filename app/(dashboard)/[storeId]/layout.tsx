import { redirect } from "next/navigation";

import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/navbar";

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ storeId: string }>
}) {
    const { storeId } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const storeDoc = await db.collection('stores').doc(storeId).get();

    if (!storeDoc.exists || storeDoc.data()?.userId !== user.userId) {
        redirect('/stores');
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
