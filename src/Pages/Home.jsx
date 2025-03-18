import { Link } from 'react-router-dom'


import Header from '../components/Header'
import Footer from '../components/Footer'
import Features from '../components/Features'
import Button from "../components/Button"


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gray-900 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">
                Transform Your Workspace with Premium Furniture
              </h1>
              <p className="text-xl mb-8">
                We have the perfect furniture designed to reflect your style and fit perfectly.
              </p>
              <div className="space-x-4">
                <Button variant="primary">Shop Now</Button>
                <Button variant="outline">Request a Quote</Button>
              </div>
            </div>
          </div>
        </section>

        <Features />

        {/* Why Choose Us Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center">
              {['ISO Certified', 'Award Winning', 'Eco-Friendly', 'Expert Support', '5-Star Rated'].map((item, index) => (
                <div key={index}>
                  <h3 className="font-semibold">{item}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>

  )
}

