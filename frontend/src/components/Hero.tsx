import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    {
        image: '/images/hero-1.png',
        title: 'Authentic African Groceries Delivered',
        subtitle: 'From premium yams to ripe plantains, get the authentic taste of home with next-day delivery.',
        cta: 'Shop Fresh Produce',
        link: '/products?category=essentials'
    },
    {
        image: '/images/hero-2.png',
        title: 'Premium Smoked & Fresh Seafood',
        subtitle: 'The finest selection of smoked catfish, jumbo prawns, and fresh mackerel for your traditional soups.',
        cta: 'Explore Seafood',
        link: '/products?category=frozen-fish'
    },
    {
        image: '/images/hero-3.png',
        title: 'Bringing bold flavours to your kitchen',
        subtitle: 'Everything from ground egusi and scotch bonnets to authentic flours and spices in one place.',
        cta: 'Browse All Items',
        link: '/products'
    },
    {
        image: '/images/hero-4.png',
        title: 'The Heart of African Tradition',
        subtitle: 'Discover the soul of Nigerian cooking with our premium hand-picked spices and traditional ingredients.',
        cta: 'Shop Spices',
        link: '/products?category=spices'
    },
    {
        image: '/images/hero-5.png',
        title: 'Vibrant Marketplace Experience',
        subtitle: 'We bring the energy and freshness of the African market straight to your doorstep across the UK.',
        cta: 'Explore More',
        link: '/products'
    },
    {
        image: '/images/hero-6.png',
        title: 'Authentic Staples You Can Trust',
        subtitle: 'From the finest flours to essential oils, we source only the most genuine products for your home.',
        cta: 'Shop Essentials',
        link: '/products?category=essentials'
    },
    {
        image: '/images/hero-7.png',
        title: 'Bold Flavors, Quality Guaranteed',
        subtitle: 'Experience the richness of Nigerian cuisine with our curated selection of premium produce.',
        cta: 'View Fresh Items',
        link: '/products?category=fresh'
    },
    {
        image: '/images/hero-8.png',
        title: 'Modern Convenience, Timeless Roots',
        subtitle: 'Elevate your cooking with the perfect balance of traditional taste and modern delivery speed.',
        cta: 'Start Shopping',
        link: '/products'
    }
];

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000); // Slightly longer for better readability

        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="relative bg-gray-900 text-white rounded-3xl overflow-hidden mb-16 h-[550px] shadow-2xl">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="relative z-20 px-8 py-24 md:px-16 md:py-32 max-w-2xl h-full flex flex-col justify-center">
                        <div className="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-bold tracking-widest uppercase rounded-full mb-6 w-fit animate-fade-in">
                            Authentic & Premium
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-white drop-shadow-md">
                            {slide.title}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed font-medium">
                            {slide.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <Link
                                to={slide.link}
                                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-primary-600 rounded-full hover:bg-primary-500 transition-all transform hover:scale-105 shadow-lg"
                            >
                                {slide.cta}
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                to="/about"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/30"
                            >
                                Our Story
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-30 pointer-events-none">
                <button
                    onClick={prevSlide}
                    className="pointer-events-auto bg-black/30 hover:bg-black/50 backdrop-blur-md p-3 rounded-full transition-all text-white border border-white/10"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="pointer-events-auto bg-black/30 hover:bg-black/50 backdrop-blur-md p-3 rounded-full transition-all text-white border border-white/10"
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-300 ${index === currentSlide
                            ? 'bg-primary-500 w-10 h-2'
                            : 'bg-white/40 hover:bg-white/60 w-2 h-2'
                            } rounded-full`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
