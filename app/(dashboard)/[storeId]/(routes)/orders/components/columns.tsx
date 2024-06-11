"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";

// Define the type for OrderColumn
export type OrderColumn = {
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  createdAt: string;
};

// Component to render the paid status with colored dots
const PaidStatus = ({ isPaid }: { isPaid: boolean }) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span
        style={{
          display: "inline-block",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: isPaid ? "green" : "red",
          marginRight: "8px",
        }}
      ></span>
      {isPaid ? "Paid" : "Unpaid"}
    </div>
  );
};

// Define the columns for the table
export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "totalPrice",
    header: "Total price",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
    cell: ({ getValue }) => <PaidStatus isPaid={getValue() as boolean} />, // Custom cell rendering with type assertion
  },
];