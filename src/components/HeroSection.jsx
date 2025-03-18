import { Link } from 'react-router-dom'
import Button from './Button'

export default function HeroSection() {
  return (
    <section className="relative h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0">
  <video
    src="./assets/herosectionvideo.mp4" // Replace with your actual video path
    alt="Modern Office Space"
    className="w-full h-full object-cover"
    autoPlay
    loop
    muted
  />
  <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay */}
</div>

      {/* Content */}
      <div className="relative h-full">
        <div className="container mx-auto px-6 h-full flex items-center">
          <div className="max-w-xl">
            <h1 className="text-white">
              <span className="block text-5xl font-bold mb-2">
                Transform Your Workspace
              </span>
              <span className="block text-4xl font-bold mb-6">
                With Premium Furniture
              </span>
            </h1>
            <p className="text-gray-200 text-lg mb-8 max-w-lg">
              For something modern and stylish, we have the perfect furniture designed 
              to reflect and fit perfectly.
            </p>
            <div className="flex gap-4">
            <Link to="/products">
                  <Button variant="primary">Shop Now</Button>
                </Link>
              <Button 
                variant="outline"
                className="px-8 py-3 text-base font-medium text-white border-white hover:bg-white/10"
              >
                Request a Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
