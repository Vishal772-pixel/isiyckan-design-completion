import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const products = [
  {
    id: 7,
    name: 'Home Office Desk',
    price: 399.99,
    image: '/assets/homeofficedesk.jpg',
    description: 'Compact desk perfect for home office',
  },
  {
    id: 8,
    name: 'Ergonomic Chair',
    price: 249.99,
    image: '/assets/Ergonomicchair.jpg',
    description: 'Comfortable chair for long work hours',
  },
  {
    id: 9,
    name: 'Adjustable Standing Desk',
    price: 499.99,
    image: '/assets/adjustabledesk.jpg',
    description: 'Height-adjustable desk for versatile working positions',
  },
  {
    id: 10,
    name: 'Desk Organizer Set',
    price: 59.99,
    image: '/assets/deskorganiserset.jpg',
    description: 'Keep your workspace tidy and organized',
  },
  {
    id: 11,
    name: 'Task Lamp',
    price: 89.99,
    image: '/assets/tasklamp.jpg',
    description: 'LED lamp with adjustable brightness levels',
  },
  {
    id: 12,
    name: 'File Cabinet',
    price: 199.99,
    image: '/assets/filecabinet.jpg',
    description: 'Spacious file cabinet with locking drawers',
  },
];

export default function HomeOffice() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on the search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold mb-4 md:mb-0">Home Office</h1>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-md w-full md:w-1/3"
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <p className="text-lg font-bold mb-4">${product.price}</p>
                <Link to={`/product/${product.id}`}>
                  <Button variant="primary" className="w-full">
                    Add to Cart
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No Products Found Message */}
        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-600 mt-8">
            No products match your search.
          </p>
        )}
      </div>
    </div>
  );
}
