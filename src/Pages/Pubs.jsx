import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Header from '../components/Header';
const products = [
  {
    id: 9,
    name: 'Bar Stool',
    price: 149.99,
    image: '/assets/bartable.jpg',
    description: 'Classic bar stool with comfortable seating'
  },
  {
    id: 10,
    name: 'Pub Table',
    price: 299.99,
    image: '/assets/pubtable.jpg',
    description: 'Sturdy pub table for commercial use'
  },
  // Add more pub furniture products
];

export default function Pubs() {
  return (
  <>
 
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Pub Furniture</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
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
                  <Button variant="primary" className="w-full" >
                  Add to cart
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}