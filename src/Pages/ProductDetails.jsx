import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { getProductById } = useProducts();
  const { addToCart } = useCart();
  
  const product = getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.name} has been added to your cart.`);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-lg text-secondary-600">{product.description}</p>
              
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary-600">
                  ${product.price}
                </p>
                <p className="text-sm text-secondary-600">
                  Rating: {product.rating} / 5
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Product Details:</h3>
                <p><span className="font-medium">Material:</span> {product.material}</p>
                <p><span className="font-medium">Dimensions:</span> {product.dimensions}</p>
                <p><span className="font-medium">Weight:</span> {product.weight}</p>
                <p><span className="font-medium">Category:</span> {product.category}</p>
                <p>
                  <span className="font-medium">Availability:</span>{' '}
                  <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Link to="/products">
                  <Button variant="secondary" className="w-full">
                    Back to Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}