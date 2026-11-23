const sampleProducts = [
  {
    name: 'Aura Pro Noise Cancelling Wireless Headphones',
    description: 'Experience studio-grade acoustics with advanced hybrid active noise cancellation, transparency mode, 40-hour battery life, and ultra-comfortable plush memory foam earcups.',
    price: 249.99,
    originalPrice: 299.99,
    category: 'Audio',
    stock: 25,
    rating: 4.8,
    numReviews: 142,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    features: [
      'Hybrid Active Noise Cancellation (up to 38dB)',
      '40-Hour Battery Life with USB-C Fast Charge',
      'Dual High-Fidelity 40mm Neodymium Drivers',
      'Multipoint Bluetooth 5.3 Connection',
      'Custom EQ control via Companion App'
    ],
    isFeatured: true
  },
  {
    name: 'Horizon Series Ultra Smartwatch',
    description: 'Elevate your everyday productivity and fitness tracking with an always-on titanium AMOLED display, ECG heart-rate sensors, GPS route tracking, and 7-day battery endurance.',
    price: 199.99,
    originalPrice: 249.99,
    category: 'Wearables',
    stock: 18,
    rating: 4.7,
    numReviews: 98,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    features: [
      '1.43" Vivid AMOLED Sapphire Glass Display',
      'Precision Dual-Frequency GNSS (GPS)',
      'SpO2, Sleep Tracking & Continuous Heart Rate',
      '50m Water Resistance (5 ATM Certified)',
      'Quick magnetic wireless dock charger'
    ],
    isFeatured: true
  },
  {
    name: 'NovaBook 14" Slim Pro Laptop',
    description: 'Built for creators and professionals on the move. Powered by an 8-core high efficiency processor, 16GB unified memory, 512GB NVMe SSD, and a stunning 2.8K OLED display.',
    price: 899.99,
    originalPrice: 999.99,
    category: 'Electronics',
    stock: 12,
    rating: 4.9,
    numReviews: 76,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    features: [
      '14-inch 2.8K 120Hz Eye-Care OLED Panel',
      '16GB LPDDR5 RAM & 512GB PCIe 4.0 SSD',
      'All-Day 14-Hour Battery Life',
      'Thunderbolt 4 & Wi-Fi 6E connectivity',
      'Backlit Ergonomic Keyboard with Fingerprint ID'
    ],
    isFeatured: true
  },
  {
    name: 'Veloce Mechanical Wireless Keyboard',
    description: 'Engineered for tactile enthusiasts and esports gamers. Features custom hot-swappable switches, PBT dye-sub keycaps, sound-dampening silicone pads, and per-key RGB backlighting.',
    price: 119.99,
    originalPrice: 149.99,
    category: 'Accessories',
    stock: 35,
    rating: 4.6,
    numReviews: 64,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    features: [
      'Hot-swappable Gateron Pro Yellow switches',
      'Tri-mode connectivity: 2.4G, Bluetooth & USB-C',
      'Double-shot PBT Cherry profile keycaps',
      'CNC Aluminum top plate casing',
      '4000mAh long-lasting rechargeable battery'
    ],
    isFeatured: true
  },
  {
    name: 'Pulse 360 Portable Bluetooth Speaker',
    description: 'Compact yet roaring with bass. Delivers room-filling 360° omnidirectional sound, IP67 waterproof certification, rugged drop-resistant build, and 18-hour continuous playtime.',
    price: 79.99,
    originalPrice: 99.99,
    category: 'Audio',
    stock: 40,
    rating: 4.5,
    numReviews: 112,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    features: [
      'IP67 Dust & Water Protection (Floats in water)',
      'Dual Passive Radiators for Deep Bass',
      'PartySync Link: pair up to 100+ speakers',
      'Hands-free speakerphone with crystal clear mic',
      'Integrated braided carry lanyard'
    ],
    isFeatured: false
  },
  {
    name: 'Zenith Minimalist Ceramic Table Lamp',
    description: 'A sculptural statement piece for modern desks and bedside tables. Features touch-capacitive 3-stage dimming, warm 2700K ambient illumination, and handcrafted ceramic base.',
    price: 64.99,
    originalPrice: 85.00,
    category: 'Home & Living',
    stock: 22,
    rating: 4.7,
    numReviews: 45,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    features: [
      'Smooth Touch Sensor with 3 Brightness Levels',
      'Flicker-Free Warm Ambient LED (2700K)',
      'Hand-thrown Matte Ceramic Vessel Design',
      'Fabric-braided aesthetic power cable',
      'Energy efficient 9W consumption'
    ],
    isFeatured: false
  },
  {
    name: 'Voyager Heritage Leather Backpack',
    description: 'Crafted from full-grain vegetable-tanned leather and water-resistant canvas. Built with a padded 15.6" laptop compartment, hidden security pocket, and antique brass hardware.',
    price: 139.99,
    originalPrice: 179.99,
    category: 'Fashion',
    stock: 15,
    rating: 4.9,
    numReviews: 88,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    features: [
      'Top-Grain Cowhide Leather & Heavy Canvas',
      'Dedicated Shockproof 15.6" Laptop Sleeve',
      'Ergonomic Padded Breathable Shoulder Straps',
      'Luggage pass-through strap for travel',
      'Reinforced base and water-repellent coating'
    ],
    isFeatured: true
  },
  {
    name: 'EchoFit Smart Body Composition Scale',
    description: 'Track 14 biometric health metrics including weight, body fat %, muscle mass, hydration, and BMI. Syncs seamlessly with Apple Health, Google Fit, and smart fitness apps.',
    price: 49.99,
    originalPrice: 59.99,
    category: 'Wearables',
    stock: 30,
    rating: 4.4,
    numReviews: 53,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    features: [
      'High-precision ITO conductive tempered glass',
      '14 Full Body Biometric Measurements',
      'Auto-recognition for up to 8 family profiles',
      'Instant Bluetooth automatic cloud sync',
      'Large high-contrast LED invisible display'
    ],
    isFeatured: false
  },
  {
    name: 'Precision 4K Ultra Webcam with Dual Mic',
    description: 'Look your best in meetings and streams. 4K Ultra HD Sony STARVIS sensor, auto-framing AI, physical magnetic privacy shutter, and stereo noise-suppressing microphones.',
    price: 89.99,
    originalPrice: 119.99,
    category: 'Electronics',
    stock: 28,
    rating: 4.6,
    numReviews: 67,
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&q=80',
    features: [
      '4K 30FPS / 1080P 60FPS Sony Sensor',
      'AI-powered Intelligent Face Auto-Framing',
      'Dual Omnidirectional Beamforming Mics',
      'Magnetic Hardware Privacy Shield',
      'Universal 360-degree monitor clamp & tripod thread'
    ],
    isFeatured: false
  },
  {
    name: 'Stelton Matte Insulated Thermal Tumbler',
    description: 'Double-walled vacuum insulation keeps hot drinks piping hot for 12 hours or iced drinks refreshing for 24 hours. Leak-proof flip lid with silicone grip band.',
    price: 29.99,
    originalPrice: 39.99,
    category: 'Home & Living',
    stock: 50,
    rating: 4.8,
    numReviews: 120,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    features: [
      '18/8 Pro Grade Kitchen Stainless Steel',
      '100% Spill & Leak Proof Magnetic Seal Cap',
      'BPA-Free, non-toxic & sweat-proof exterior',
      'Fits standard automotive cup holders',
      'Dishwasher safe components'
    ],
    isFeatured: false
  },
  {
    name: 'AeroGlide Ergonomic Wireless Mouse',
    description: 'Designed in consultation with leading ergonomists to reduce muscle strain by 40%. Features a natural 57° vertical handshake angle, silent clicks, and thumb scroll wheel.',
    price: 59.99,
    originalPrice: 69.99,
    category: 'Accessories',
    stock: 32,
    rating: 4.7,
    numReviews: 82,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
    features: [
      '57-Degree Natural Handshake Elevation',
      '4000 DPI High-Precision Optical Sensor',
      'Whisper-quiet switches (90% noise reduction)',
      'Cross-computer Flow control for 3 devices',
      'Rechargeable 500mAh Li-Po battery'
    ],
    isFeatured: false
  },
  {
    name: 'Urban Classic Polarized Sunglasses',
    description: 'Timeless unisex silhouette with premium hand-polished acetate frame, UV400 polarized scratch-resistant lenses, and 5-barrel German hinges for maximum durability.',
    price: 74.99,
    originalPrice: 95.00,
    category: 'Fashion',
    stock: 20,
    rating: 4.7,
    numReviews: 41,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    features: [
      '100% UV400 Glare-blocking Polarized Lenses',
      'Bio-acetate Eco-friendly Lightweight Frames',
      'Spring-loaded 5-barrel hinges for snug fit',
      'Includes vegan leather hard case & microfiber cloth',
      'Anti-reflective inner lens coating'
    ],
    isFeatured: false
  }
];

module.exports = sampleProducts;
