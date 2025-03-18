import { Truck, Tag, Target, Shield } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: <Truck className="w-12 h-12 text-red-600" />,
      title: 'Fast Delivery',
      description: 'Quick shipping nationwide'
    },
    {
      icon: <Tag className="w-12 h-12 text-red-600" />,
      title: 'Bulk Discounts',
      description: 'Special prices for large orders'
    },
    {
      icon: <Target className="w-12 h-12 text-red-600" />,
      title: '24/7 Support',
      description: 'Always here to help you'
    },
    {
      icon: <Shield className="w-12 h-12 text-red-600" />,
      title: 'Warranty',
      description: '5-year warranty on all items'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

