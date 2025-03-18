import { useAdmin } from '../../context/AdminContext';

export default function AdminDashboard() {
  const { orders, products } = useAdmin();

  const ordersByStatus = {
    pending: orders.filter(order => order.status === 'pending').length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Orders Overview</h2>
            <div className="space-y-2">
              <p>Pending Orders: {ordersByStatus.pending}</p>
              <p>Delivered Orders: {ordersByStatus.delivered}</p>
              <p>Cancelled Orders: {ordersByStatus.cancelled}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            <p>Total Products: {products.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full bg-primary-600 text-white px-4 py-2 rounded">
                Add New Product
              </button>
              <button className="w-full bg-secondary-600 text-white px-4 py-2 rounded">
                View All Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}