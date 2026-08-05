"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Plus, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStoreModal } from "@/hooks/use-store-modal";

interface Store {
  id: string;
  name: string;
  createdAt: string;
}

const StoresPage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const storeModal = useStoreModal();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get('/api/stores');
        setStores(response.data);
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const onStoreSelect = (storeId: string) => {
    router.push(`/${storeId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Stores</h1>
            <p className="text-gray-600 mt-2">Select a store to manage or create a new one</p>
          </div>
          <Button onClick={storeModal.onOpen} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Store
          </Button>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores yet</h3>
            <p className="text-gray-600 mb-4">Create your first store to get started</p>
            <Button onClick={storeModal.onOpen}>
              <Plus className="h-4 w-4 mr-2" />
              Create Store
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card
                key={store.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onStoreSelect(store.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    {store.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Created {new Date(store.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresPage;