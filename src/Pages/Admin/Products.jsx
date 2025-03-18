import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useProducts } from '../../context/ProductContext';

export default function AdminProducts() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const initialProductState = {
    name: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    description: '',
    material: '',
    dimensions: '',
    weight: ''
  };

  const [newProduct, setNewProduct] = useState(initialProductState);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      setNewProduct(prev => ({
        ...prev,
        image: file
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing && currentProduct) {
      updateProduct(currentProduct.id, newProduct);
    } else {
      addProduct(newProduct);
    }
    setNewProduct(initialProductState);
    setIsEditing(false);
    setCurrentProduct(null);
    setImagePreview('');
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setNewProduct(product);
    setImagePreview(product.image);
  };

  const handleDelete = (id) => {
    deleteProduct(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <Button
          variant="primary"
          onClick={() => {
            setIsEditing(false);
            setCurrentProduct(null);
            setNewProduct(initialProductState);
            setImagePreview('');
          }}
        >
          Add New Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="chairs">Chairs</option>
                  <option value="tables">Tables</option>
                  <option value="storage">Storage</option>
                  <option value="lighting">Lighting</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Material</label>
                <input
                  type="text"
                  name="material"
                  value={newProduct.material}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                <input
                  type="text"
                  name="dimensions"
                  value={newProduct.dimensions}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Weight</label>
                <input
                  type="text"
                  name="weight"
                  value={newProduct.weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              <input
                type="file"
                name="image"
                onChange={handleInputChange}
                accept="image/*"
                className="mt-1 block w-full"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 h-32 w-32 object-cover rounded-lg"
                />
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentProduct(null);
                  setNewProduct(initialProductState);
                  setImagePreview('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </form>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Product List</h3>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-sm text-gray-600">${product.price}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}