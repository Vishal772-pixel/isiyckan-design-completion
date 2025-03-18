import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    address: '123 Main St, City, Country',
    phone: '+1 234 567 8900',
    memberSince: '2023'
  });

  const [transactions] = useState([
    {
      id: 1,
      date: '2023-12-20',
      items: ['Modern Wooden Chair', 'Glass Coffee Table'],
      total: 499.98,
      status: 'Delivered'
    },
    {
      id: 2,
      date: '2023-12-15',
      items: ['Executive Office Chair'],
      total: 299.99,
      status: 'In Transit'
    }
  ]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <Button variant="primary" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-600">
                {userData.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userData.name}</h2>
              <p className="text-gray-600">Member since {userData.memberSince}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{userData.phone}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{userData.address}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-600">
            <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">{transactions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
            <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
            <p className="text-3xl font-bold">
              ${transactions.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-600">
            <h3 className="text-lg font-semibold mb-2">Active Orders</h3>
            <p className="text-3xl font-bold">
              {transactions.filter(t => t.status === 'In Transit').length}
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      #{transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4">
                      {transaction.items.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${transaction.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}