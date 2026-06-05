import { useQuery } from "@tanstack/react-query";
import { Package, Users, ShoppingCart } from "lucide-react";
import { productsApi, customersApi, ordersApi } from "../api/client";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color }}>
        <Icon size={24} />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.list,
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.list,
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.list,
  });

  const lowStock = products.filter((p) => p.stock_quantity < 10).length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your inventory and orders</p>
      </div>

      <div className="stats-grid">
        <StatCard icon={Package} label="Products" value={products.length} color="#3b82f6" />
        <StatCard icon={Users} label="Customers" value={customers.length} color="#8b5cf6" />
        <StatCard icon={ShoppingCart} label="Orders" value={orders.length} color="#10b981" />
        <StatCard icon={Package} label="Low Stock Items" value={lowStock} color="#f59e0b" />
        <StatCard icon={ShoppingCart} label="Pending Orders" value={pendingOrders} color="#ef4444" />
        <StatCard
          icon={ShoppingCart}
          label="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          color="#06b6d4"
        />
      </div>
    </div>
  );
}
