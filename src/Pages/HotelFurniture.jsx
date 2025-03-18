import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const productSets = [
  {
    id: 1,
    name: 'Luxury Bedroom Set',
    price: 2499.99,
    image: '/assets/Bedroomset.jpg',
    description: 'Includes a premium king-sized bed, two nightstands, and a dresser.'
  },
  {
    id: 2,
    name: 'Executive Lounge Set',
    price: 1899.99,
    image: '/assets/executivelounge.jpg',
    description: 'Consists of a lounge chair, a sofa, a coffee table, and a floor lamp.'
  },
  {
    id: 3,
    name: 'Modern Workspace Set',
    price: 1499.99,
    image: '/assets/workspaceset.jpg',
    description: 'Includes a work desk, an ergonomic chair, and a side storage unit.'
  },
  {
    id: 4,
    name: 'Premium Living Room Set',
    price: 3299.99,
    image: '/assets/livingroomset.jpg',
    description: 'Features a sofa, two armchairs, a coffee table, and a TV console.'
  },
  {
    id: 5,
    name: 'Compact Guest Room Set',
    price: 1799.99,
    image: '/assets/guestroomset.jpg',
    description: 'Includes a double bed, a nightstand, a small desk, and a chair.'
  }
];

export default function HotelFurniture() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter product sets based on search query
  const filteredProductSets = productSets.filter(
    (set) =>
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Hotel Furniture</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for furniture sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Product Sets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProductSets.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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

        {/* No Results Message */}
        {filteredProductSets.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No furniture sets found.</p>
        )}
      </div>
    </div>
  );
}
