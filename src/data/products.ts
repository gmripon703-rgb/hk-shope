import smartwatchImg from '../assets/images/smartwatch_dropship_1791051037694.jpg';
import earbudsImg from '../assets/images/earbuds_dropship_1791051052010.jpg';
import chargerImg from '../assets/images/charger_dropship_1791051064251.jpg';
import pillowImg from '../assets/images/pillow_dropship_1791051077470.jpg';
import { Product } from '../types/store';

export const PRODUCTS: Product[] = [
  {
    id: 'prod-smartwatch-ultra',
    name: 'AeroTitan X Smartwatch',
    subtitle: 'Grade 5 Aerospace Titanium · AMOLED Display · 14-Day Battery',
    price: 49.99,
    originalPrice: 89.99,
    rating: 4.9,
    reviewCount: 384,
    category: 'electronics',
    inStock: true,
    stockCount: 14,
    badge: 'Trending Drop',
    image: smartwatchImg,
    isHotDropship: true,
    description: 'Precision-machined from titanium alloy, the AeroTitan X delivers continuous biometric tracking, waterproof endurance, and ultra-crisp always-on AMOLED clarity.',
    features: [
      'Military Grade Titanium Unibody & Sapphire Glass',
      'Continuous SpO2, Heart Rate, & Sleep Architecture',
      'IP68 50M Waterproof for swimming & shower',
      'Ultra-fast 20-min magnetic quick charge'
    ],
    specs: {
      'Casing': 'Titanium Alloy',
      'Battery Life': '14 Days Typical',
      'Compatibility': 'iOS 12+ & Android 8+',
      'Water Resistance': '5ATM / 50M'
    }
  },
  {
    id: 'prod-earbuds-anc',
    name: 'AcousticPulse ANC Pods',
    subtitle: '42dB Hybrid Noise Cancellation · Hi-Res Audio · Low Latency',
    price: 34.50,
    originalPrice: 59.99,
    rating: 4.8,
    reviewCount: 512,
    category: 'electronics',
    inStock: true,
    stockCount: 22,
    badge: 'Best Seller',
    image: earbudsImg,
    isHotDropship: true,
    description: 'Banish ambient room noise and street traffic with dual-mic feedforward active noise cancellation and custom 12mm graphene sound drivers.',
    features: [
      'Up to -42dB intelligent background noise reduction',
      'Quad-microphone AI voice clarity for phone calls',
      '36-Hour playback with pocket charging case',
      'Gaming low-latency mode (40ms synch)'
    ],
    specs: {
      'Driver Size': '12mm Graphene Dynamic',
      'Bluetooth': 'v5.4 Ultra-Stable',
      'Total Playtime': '36 Hours with case',
      'Charging': 'USB-C + Qi Wireless'
    }
  },
  {
    id: 'prod-mag-station',
    name: 'MagFold 3-in-1 Charging Dock',
    subtitle: '15W MagSafe Fast Charge · Foldable Travel Design · Aluminum',
    price: 29.90,
    originalPrice: 48.00,
    rating: 4.9,
    reviewCount: 229,
    category: 'accessories',
    inStock: true,
    stockCount: 9,
    badge: 'Viral TikTok Pick',
    image: chargerImg,
    isHotDropship: true,
    description: 'Power your Phone, Smartwatch, and Wireless Earbuds simultaneously with a single cable. Precision anodized aluminum hinges fold flat for effortless travel.',
    features: [
      'Official 15W MagSafe-compatible magnetic alignment',
      'All-in-one charging station eliminates cord tangle',
      'Folds down to the thickness of a notebook',
      'Intelligent temperature and overcharge protection'
    ],
    specs: {
      'Material': 'Space-Grade Anodized Aluminum',
      'Input': 'Type-C 9V/3A',
      'Output Phone': '15W / 10W / 7.5W',
      'Weight': '185g'
    }
  },
  {
    id: 'prod-contour-pillow',
    name: 'OrthoRest Ergonomic Cervical Pillow',
    subtitle: 'Slow-Rebound Memory Foam · Spine Alignment · Cooling Ice Mesh',
    price: 38.00,
    originalPrice: 65.00,
    rating: 4.9,
    reviewCount: 418,
    category: 'comfort',
    inStock: true,
    stockCount: 18,
    badge: 'Pain Relief',
    image: pillowImg,
    isHotDropship: true,
    description: 'Designed by orthopedic physiotherapists to cradle your cervical spine, decompress neck tension, and promote deep restorative sleep in any position.',
    features: [
      'Custom cervical groove promotes proper cervical spine lordosis',
      'Breathable ice-silk cooling pillowcase, machine washable',
      'High-density 60D slow-rebound memory foam, never goes flat',
      'Ideal for back, side, and combination sleepers'
    ],
    specs: {
      'Core': '100% Pure High-Density Memory Foam',
      'Cover': 'Cooling Breathable Ice Silk Blend',
      'Dimensions': '60 x 35 x 11 cm',
      'Certification': 'OEKO-TEX Standard 100'
    }
  }
];

export const FREE_SHIPPING_THRESHOLD = 50.0;
export const STANDARD_SHIPPING_FEE = 4.99;
