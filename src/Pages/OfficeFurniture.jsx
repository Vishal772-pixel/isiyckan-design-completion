import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const productSets = [
  {
    id: 1,
    name: 'Executive Office Set',
    price: 1999.99,
    image: '/assets/executiveofficeset.jpg',
    description: 'Includes an executive desk, ergonomic chair, and a filing cabinet.'
  },
  {
    id: 2,
    name: 'Collaborative Workspace Set',
    price: 1499.99,
    image: '/assets/collaborativeworkspaceset.jpg',
    description: 'Features a large shared table, four ergonomic chairs, and storage units.'
  },
  {
    id: 3,
    name: 'Home Office Set',
    price: 999.99,
    image: '/assets/Homeofficeset.jpg',
    description: 'Includes a compact desk, a comfortable chair, and a bookshelf.'
  },
  {
    id: 4,
    name: 'Meeting Room Set',
    price: 2999.99,
    image: '/assets/meetingroomset.jpg',
    description: 'Consists of a conference table, eight chairs, and a presentation board.'
  },
  {
    id: 5,
    name: 'Reception Area Set',
    price: 2499.99,
    image: '/assets/receptionset.jpg',
    description: 'Includes a reception desk, two lounge chairs, and a coffee table.'
  }
];

export default function OfficeFurniture() {
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
        <h1 className="text-4xl font-bold mb-8">Office Furniture</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for office furniture sets..."
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
          <p className="text-center text-gray-500 mt-8">No office furniture sets found.</p>
        )}
      </div>
    </div>
  );
}
