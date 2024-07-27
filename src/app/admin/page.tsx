import DashboardCard from "@/components/DashboardCard";
import React from "react";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import db from "@/lib/db";

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });
  return {
    amout: (data._sum.pricePaidInCents || 0) / 100,
    nbrOfSales: data._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);
  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

async function getProductData() {
  const [activeCount, inactiveCount] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } }),
  ]);
  return {
    activeCount,
    inactiveCount,
  };
}

async function AdminDashboard() {
  const [salesData, userData,productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData()
  ]);




  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Sales"
        subtitle={`${formatNumber(salesData.nbrOfSales)} Orders`}
        body={formatCurrency(salesData.amout)}
      />
      <DashboardCard
        title="Customers"
        subtitle={`${formatCurrency(
          userData.averageValuePerUser
        )} Average Value`}
        body={formatNumber(userData.userCount)}
      />
      <DashboardCard
        title="Active Products"
        subtitle={`${formatNumber(
          productData.inactiveCount
        )} Inactive Products`}
        body={formatNumber(productData.activeCount)}
      />
    </div>
  );
}

export default AdminDashboard;
