import { Link } from 'react-router-dom';

const categories = [
  {
    id: 1,
    name: 'Office Furniture',
    image: '/assets/Frame.png',
    path: '/office-furniture'
  },
  {
    id: 2,
    name: 'Hotel Furniture',
    image: '/assets/Frame (1).png',
    path: '/hotel-furniture'
  },
  {
    id: 3,
    name: 'Home Office',
    image: '/assets/Frame (2).png',
    path: '/home-office'
  },
  {
    id: 4,
    name: 'Pubs',
    image: '/assets/Frame (3).png',
    path: '/pubs'
  }
];

export default function ViewItems() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Collections</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.path}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                <div className="aspect-w-4 aspect-h-3">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600">
                    Explore our {category.name.toLowerCase()} collection
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}