import { redirect } from "next/navigation";

import StoreSwitcher from "@/components/store-switcher";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";
import { db } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/auth";

const Navbar = async () => {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const storesSnapshot = await db
        .collection('stores')
        .where('userId', '==', user.userId)
        .orderBy('createdAt', 'desc')
        .get();

    const stores = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <StoreSwitcher items={stores} />
                <MainNav className="mx-6" />
                <div className="ml-auto flex items-center space-x-4">
                    <ThemeToggle />
                    <UserNav />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
