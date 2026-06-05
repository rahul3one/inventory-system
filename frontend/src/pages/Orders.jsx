import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { ordersApi, customersApi, productsApi } from "../api/client";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const emptyItem = { product_id: "", quantity: "1" };

export default function Orders() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [stockError, setStockError] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.list,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.list,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Order created");
      resetForm();
    },
    onError: (err) => {
      const detail = err.response?.data?.detail;
      const message = typeof detail === "string" ? detail : "Failed to create order";
      setStockError(message);
      toast.error(message);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to update status"),
  });

  const resetForm = () => {
    setFormOpen(false);
    setCustomerId("");
    setItems([{ ...emptyItem }]);
    setStockError("");
  };

  const addItemRow = () => setItems([...items, { ...emptyItem }]);

  const removeItemRow = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
    setStockError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStockError("");

    const payload = {
      customer_id: parseInt(customerId, 10),
      items: items.map((item) => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10),
      })),
    };

    createMutation.mutate(payload);
  };

  const getCustomerName = (id) => customers.find((c) => c.id === id)?.name || `Customer #${id}`;
  const getProductName = (id) => products.find((p) => p.id === id)?.name || `Product #${id}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p>Create and manage customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
          <Plus size={16} /> New Order
        </button>
      </div>

      {formOpen && (
        <div className="order-form-card">
          <h3>Create Order</h3>
          <form onSubmit={handleSubmit}>
            <label>
              Customer
              <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <div className="order-items">
              <h4>Order Items</h4>
              {items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <select
                    required
                    value={item.product_id}
                    onChange={(e) => updateItem(index, "product_id", e.target.value)}
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (stock: {p.stock_quantity})
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  />
                  <button type="button" className="btn btn-icon btn-danger" onClick={() => removeItemRow(index)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn" onClick={addItemRow}>
                <Plus size={16} /> Add Item
              </button>
            </div>

            {stockError && <div className="error-banner">{stockError}</div>}

            <div className="modal-actions">
              <button type="button" className="btn" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                Create Order
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="empty-row">Loading...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-row">No orders yet</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{getCustomerName(o.customer_id)}</td>
                  <td>
                    {o.items?.map((item) => (
                      <div key={item.id} className="item-chip">
                        {getProductName(item.product_id)} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td>${o.total_amount.toFixed(2)}</td>
                  <td>
                    <select
                      className={`status-select status-${o.status}`}
                      value={o.status}
                      onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
