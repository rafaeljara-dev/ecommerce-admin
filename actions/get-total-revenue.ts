import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async (storeId: string) => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });

  const totalRevenue = paidOrders.reduce((total: number, order: any) => {
    // Se especifica el tipo de 'total' como 'number' y el tipo de 'order' como 'any'
    const orderTotal = order.orderItems.reduce((orderSum: number, item: any) => {
      // Se especifica el tipo de 'orderSum' como 'number' y el tipo de 'item' como 'any'
      return orderSum + item.product.price.toNumber();
    }, 0);
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};
