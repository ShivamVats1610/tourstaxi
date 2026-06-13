// Centralized mock data for ToursTaxi

export const COMPANY = {
  name: 'ToursTaxi',
  tagline: 'Premium Cabs. Unforgettable Journeys.',
  phone: '+91 8955458128',
  phoneRaw: '+918955458128',
  email: 'tourstaxi.com@gmail.com',
  address: 'City Center, Indra Colony, Sawai Madhopur, Rajasthan 322001',
  hours: 'Open 24 × 7'
};

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Fleet', href: '/fleet' },
  { label: 'Routes', href: '/popular-routes' },
  { label: 'Tour Packages', href: '/tour-packages' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' }
];

export const STATS = [
  { value: '10,000+', label: 'Happy Trips' },
  { value: '500+', label: 'Expert Drivers' },
  { value: '100+', label: 'Cities Covered' },
  { value: '4.9★', label: 'Customer Rating' }
];

export const WHY_CHOOSE = [
  { icon: 'ShieldCheck', title: 'Safe & Verified', desc: 'Background-checked drivers and sanitised, GPS-tracked cabs on every ride.' },
  { icon: 'BadgeIndianRupee', title: 'Transparent Pricing', desc: 'No surge, no hidden fees. The price you see is the price you pay.' },
  { icon: 'Headphones', title: '24/7 Support', desc: 'Round-the-clock assistance from our Sawai Madhopur dispatch team.' },
  { icon: 'Clock', title: 'On-Time Pickup', desc: '98% on-time performance — your driver arrives before the meter starts.' },
  { icon: 'Sparkles', title: 'Premium Fleet', desc: 'Spotless Dzires, Innovas, Crystas and Tempos refreshed every quarter.' },
  { icon: 'Route', title: 'Pan-India Reach', desc: 'Outstation, airport, local rental and tour packages across 100+ cities.' }
];

export const FLEET = [
  {
    slug: 'swift-dzire',
    name: 'Swift Dzire',
    category: 'Sedan',
    image: 'https://images.pexels.com/photos/3685373/pexels-photo-3685373.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    seats: 4,
    luggage: '2 Bags',
    ac: true,
    features: ['Music System', 'Push-Back Seats', 'GPS Tracked', 'First-Aid Kit'],
    pricePerKm: 14,
    startPrice: 1499,
    badge: 'Most Booked'
  },
  {
    slug: 'ertiga',
    name: 'Maruti Ertiga',
    category: 'MPV · 6+1 Seater',
    image: 'https://images.pexels.com/photos/18029642/pexels-photo-18029642.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    seats: 6,
    luggage: '3 Bags',
    ac: true,
    features: ['Captain Seats', 'USB Charging', 'Roomy Boot', 'GPS Tracked'],
    pricePerKm: 16,
    startPrice: 1899,
    badge: 'Family Choice'
  },
  {
    slug: 'innova',
    name: 'Toyota Innova',
    category: 'SUV · 6+1 Seater',
    image: 'https://images.unsplash.com/photo-1574701427742-acc058398496?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwzfHxTVVYlMjBJbmRpYXxlbnwwfHx8fDE3ODA3Mjc2ODZ8MA&ixlib=rb-4.1.0&q=85',
    seats: 6,
    luggage: '4 Bags',
    ac: true,
    features: ['Reclining Seats', 'Twin AC', 'Music System', 'GPS Tracked'],
    pricePerKm: 18,
    startPrice: 2499,
    badge: 'Best Seller'
  },
  {
    slug: 'innova-crysta',
    name: 'Innova Crysta',
    category: 'Luxury SUV · 6+1',
    image: 'https://images.unsplash.com/photo-1625037669075-e5472e080265?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxTVVYlMjBJbmRpYXxlbnwwfHx8fDE3ODA3Mjc2ODZ8MA&ixlib=rb-4.1.0&q=85',
    seats: 6,
    luggage: '4 Bags',
    ac: true,
    features: ['Leather Captain Seats', 'Ambient Lighting', 'Reading Lights', 'Premium Audio'],
    pricePerKm: 22,
    startPrice: 2999,
    badge: 'Premium'
  },
  {
    slug: 'hycross',
    name: 'Toyota Hycross',
    category: 'Hybrid Luxury · 6+1',
    image: 'https://images.pexels.com/photos/15037902/pexels-photo-15037902.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    seats: 6,
    luggage: '4 Bags',
    ac: true,
    features: ['Self-Charging Hybrid', 'Panoramic Sunroof', 'Ottoman Seats', 'JBL Audio'],
    pricePerKm: 24,
    startPrice: 3499,
    badge: 'New'
  },
  {
    slug: 'tempo-traveller',
    name: 'Tempo Traveller',
    category: 'Group · 12+1 Seater',
    image: 'https://images.pexels.com/photos/4542998/pexels-photo-4542998.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    seats: 12,
    luggage: '12 Bags',
    ac: true,
    features: ['Pushback Seats', 'Twin AC', 'Large Boot', 'LED TV'],
    pricePerKm: 28,
    startPrice: 5999,
    badge: 'Group Travel'
  }
];

export const PACKAGES = [
  {
    slug: 'ranthambore-safari',
    title: 'Ranthambore Tiger Safari',
    duration: '2 Days · 1 Night',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1615474286632-e31ac3633d58?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwxfHx0aWdlciUyMHNhZmFyaXxlbnwwfHx8fDE3ODA3Mjc2ODZ8MA&ixlib=rb-4.1.0&q=85',
    description: 'Spot the majestic Royal Bengal Tiger in its natural habitat with two jungle safaris, heritage stay and curated meals.',
    inclusions: ['2 Jungle Safaris', 'AC Resort Stay', 'Breakfast & Dinner', 'Cab from Sawai Madhopur'],
    tag: 'Wildlife'
  },
  {
    slug: 'jaipur-tour',
    title: 'Jaipur Pink City Tour',
    duration: '2 Days · 1 Night',
    price: 7499,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxSYWphc3RoYW58ZW58MHx8fHwxNzgwNzI3Njc3fDA&ixlib=rb-4.1.0&q=85',
    description: 'Explore Amber Fort, Hawa Mahal, City Palace and Jantar Mantar with a local heritage walk and Chokhi Dhani dinner.',
    inclusions: ['4★ Hotel Stay', 'Sightseeing Cab', 'Monument Tickets', 'Local Guide'],
    tag: 'Heritage'
  },
  {
    slug: 'golden-triangle',
    title: 'Golden Triangle Tour',
    duration: '5 Days · 4 Nights',
    price: 18999,
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwzfHxUYWolMjBNYWhhbHxlbnwwfHx8fDE3ODA3Mjc2ODZ8MA&ixlib=rb-4.1.0&q=85',
    description: 'India\u2019s iconic circuit \u2014 Delhi, Agra (Taj Mahal) and Jaipur \u2014 in chauffeured comfort with handpicked hotels.',
    inclusions: ['Delhi · Agra · Jaipur', 'Innova Crysta Cab', 'Premium Hotels', 'Taj Mahal Tour'],
    tag: 'Bestseller'
  },
  {
    slug: 'rajasthan-heritage',
    title: 'Rajasthan Heritage Tour',
    duration: '7 Days · 6 Nights',
    price: 28999,
    image: 'https://images.pexels.com/photos/36470626/pexels-photo-36470626.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    description: 'Jaipur \u2192 Pushkar \u2192 Jodhpur \u2192 Jaisalmer \u2192 Udaipur. Forts, palaces, dunes and sunset camel rides.',
    inclusions: ['5 Cities Covered', 'Heritage Havelis', 'Desert Camp', 'Dedicated Driver'],
    tag: 'Premium'
  }
];

export const ROUTES = [
  { from: 'Jaipur', to: 'Ranthambore', distance: '180 km', duration: '4h', price: 3499, image: 'https://images.pexels.com/photos/11373628/pexels-photo-11373628.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
  { from: 'Delhi', to: 'Ranthambore', distance: '395 km', duration: '7h', price: 6499, image: 'https://images.pexels.com/photos/16155546/pexels-photo-16155546.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
  { from: 'Agra', to: 'Ranthambore', distance: '255 km', duration: '5h', price: 4999, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwyfHxUYWolMjBNYWhhbHxlbnwwfHx8fDE3ODA3Mjc2ODZ8MA&ixlib=rb-4.1.0&q=85' },
  { from: 'Kota', to: 'Ranthambore', distance: '110 km', duration: '2h 30m', price: 2299, image: 'https://images.pexels.com/photos/36470562/pexels-photo-36470562.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
  { from: 'Jaipur', to: 'Udaipur', distance: '395 km', duration: '7h', price: 6999, image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxSYWphc3RoYW58ZW58MHx8fHwxNzgwNzI3Njc3fDA&ixlib=rb-4.1.0&q=85' },
  { from: 'Sawai Madhopur', to: 'Jaipur', distance: '180 km', duration: '4h', price: 3299, image: 'https://images.unsplash.com/photo-1586617356423-52763004deac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwyfHx0aWdlciUyMHNhZmFyaXxlbnwwfHx8fDE3ODA3Mjc2ODZ8MA&ixlib=rb-4.1.0&q=85' }
];

export const SERVICES = [
  { icon: 'ArrowRight', title: 'One Way Drop', desc: 'Pay only for one side — perfect for outstation drops with no return charges.' },
  { icon: 'Repeat', title: 'Round Trip', desc: 'Multi-day outstation cabs with the same trusted driver for the entire trip.' },
  { icon: 'Timer', title: 'Local Rentals', desc: 'Hourly packages — 4hr/40km, 8hr/80km, 12hr/120km — within city limits.' },
  { icon: 'Plane', title: 'Airport Transfer', desc: 'Flight-tracked airport pickups & drops at Jaipur, Delhi and Udaipur airports.' },
  { icon: 'Tent', title: 'Tour Packages', desc: 'Curated multi-city Rajasthan and Golden Triangle holidays with stay & sightseeing.' },
  { icon: 'Briefcase', title: 'Corporate Travel', desc: 'Monthly billed corporate cabs with dedicated relationship managers.' }
];

export const TESTIMONIALS = [
  { name: 'Aarav Mehta', city: 'Mumbai', rating: 5, text: 'Booked an Innova Crysta from Jaipur to Ranthambore. Driver was punctual, cab was spotless and pricing was honest. Will book again!', avatar: 'https://i.pravatar.cc/120?img=12' },
  { name: 'Priya Sharma', city: 'Delhi', rating: 5, text: 'Did the Golden Triangle with ToursTaxi. Hotels, cab, guide \u2014 everything was top-notch. Our driver Rajesh felt like family by day 5.', avatar: 'https://i.pravatar.cc/120?img=47' },
  { name: 'Rahul Verma', city: 'Bangalore', rating: 5, text: 'The tiger safari package was beautifully planned. Saw T-19 on the first safari! Highly recommend ToursTaxi for Ranthambore.', avatar: 'https://i.pravatar.cc/120?img=33' },
  { name: 'Anjali Singh', city: 'Pune', rating: 5, text: 'Hired a Tempo Traveller for 12 of us for a 7-day Rajasthan trip. Smooth ride, helpful driver and unbeatable price.', avatar: 'https://i.pravatar.cc/120?img=44' }
];

export const FAQS = [
  { q: 'How do I book a cab with ToursTaxi?', a: 'Use the booking widget on our homepage, call +91 8955458128 or WhatsApp us. You\u2019ll get instant confirmation with driver details.' },
  { q: 'Are there any hidden charges?', a: 'Never. Our quoted fare includes driver allowance, fuel and taxes. Only state-border taxes and parking (if any) are billed at actuals.' },
  { q: 'Can I cancel my booking?', a: 'Yes \u2014 free cancellation up to 4 hours before pickup. Cancellations after that attract a small cab-allotment fee.' },
  { q: 'Are your drivers verified?', a: 'Every driver goes through police verification, document checks and a hospitality training before joining ToursTaxi.' },
  { q: 'Do you operate 24×7?', a: 'Yes, our dispatch team and cabs run round-the-clock, including all major holidays.' },
  { q: 'What cabs are available for outstation trips?', a: 'Swift Dzire, Ertiga, Innova, Innova Crysta, Hycross and Tempo Traveller \u2014 select what suits your group size.' },
  { q: 'Do you provide GST invoices for corporate bookings?', a: 'Absolutely. Share your GSTIN at the time of booking and we\u2019ll email a GST-compliant invoice after the trip.' },
  { q: 'Is Ranthambore safari included in tour packages?', a: 'Yes \u2014 our Ranthambore Tiger Safari package includes two confirmed jungle safaris (canter/gypsy basis availability).' }
];

export const BLOG_POSTS = [
  {
    slug: 'best-time-to-visit-ranthambore',
    title: 'Best Time to Visit Ranthambore for Tiger Sightings',
    excerpt: 'A month-by-month guide to maximising your chances of seeing a Royal Bengal Tiger on safari.',
    category: 'Wildlife',
    author: 'Vikram Singh',
    date: '12 May 2025',
    readMin: 6,
    image: 'https://images.unsplash.com/photo-1680140979890-101e2798dddf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwzfHx0aWdlciUyMHNhZmFyaXxlbnwwfHx8fDE3ODA3Mjc2ODZ8MA&ixlib=rb-4.1.0&q=85'
  },
  {
    slug: 'golden-triangle-itinerary-5-days',
    title: 'The Perfect 5-Day Golden Triangle Itinerary',
    excerpt: 'Delhi, Agra and Jaipur \u2014 day-by-day planning with where to stay, what to eat and how to get around.',
    category: 'Itineraries',
    author: 'Neha Kapoor',
    date: '02 May 2025',
    readMin: 9,
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwzfHxUYWolMjBNYWhhbHxlbnwwfHx8fDE3ODA3Mjc2ODZ8MA&ixlib=rb-4.1.0&q=85'
  },
  {
    slug: 'jaipur-hidden-gems',
    title: '10 Hidden Gems of Jaipur Beyond the Pink Walls',
    excerpt: 'Skip the queues at Hawa Mahal \u2014 here are 10 lesser-known spots locals love in the Pink City.',
    category: 'Heritage',
    author: 'Rohan Joshi',
    date: '20 April 2025',
    readMin: 7,
    image: 'https://images.pexels.com/photos/36470626/pexels-photo-36470626.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  },
  {
    slug: 'choosing-the-right-cab',
    title: 'Dzire vs Ertiga vs Innova: Which Cab Should You Book?',
    excerpt: 'A practical buyer\u2019s guide for families, couples and groups planning outstation trips in Rajasthan.',
    category: 'Travel Tips',
    author: 'ToursTaxi Team',
    date: '14 April 2025',
    readMin: 5,
    image: 'https://images.pexels.com/photos/18029642/pexels-photo-18029642.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  },
  {
    slug: 'taj-mahal-sunrise-guide',
    title: 'Watching Sunrise at the Taj Mahal: A Complete Guide',
    excerpt: 'Tickets, timings, photography spots and the secret east-gate entrance you\u2019ve probably never heard of.',
    category: 'Heritage',
    author: 'Neha Kapoor',
    date: '02 April 2025',
    readMin: 6,
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwyfHxUYWolMjBNYWhhbHxlbnwwfHx8fDE3ODA3Mjc2ODZ8MA&ixlib=rb-4.1.0&q=85'
  },
  {
    slug: 'rajasthan-road-trip-checklist',
    title: 'The Ultimate Rajasthan Road-Trip Packing Checklist',
    excerpt: 'From sunscreen to power banks \u2014 here is everything our drivers wish guests packed (and what to leave behind).',
    category: 'Travel Tips',
    author: 'Vikram Singh',
    date: '25 March 2025',
    readMin: 4,
    image: 'https://images.pexels.com/photos/11373628/pexels-photo-11373628.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  }
];

export const BLOG_CATEGORIES = [
  { name: 'Wildlife', count: 4 },
  { name: 'Itineraries', count: 7 },
  { name: 'Heritage', count: 9 },
  { name: 'Travel Tips', count: 12 },
  { name: 'Food & Stay', count: 5 }
];
