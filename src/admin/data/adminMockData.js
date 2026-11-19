import { PRODUCTS } from '../../data/products';
import { INITIAL_ORDERS } from '../../data/orders';

export const INITIAL_ADMIN_PRODUCTS = PRODUCTS.map((p, idx) => ({
  ...p,
  title: p.name || p.title || 'Signature Atelier Garment',
  name: p.name || p.title || 'Signature Atelier Garment',
  price: p.priceLKR || p.price || 18500,
  gsm: p.gsm || 240,
  composition: p.fabricProvenance || 'Durable Comfort Knit Blend',
  inventory: {
    'XS': 8,
    'S': 12 - (idx * 2),
    'M': 18 - (idx * 2),
    'L': 22 - (idx * 3),
    'XL': 14 - (idx * 2),
    '2XL': 8 - idx
  },
  status: 'Active',
  sku: `ELV-TEE-00${idx + 1}`,
  totalSales: 45 + (idx * 18)
}));

export const INITIAL_ADMIN_ORDERS = [
  ...INITIAL_ORDERS,
  {
    orderId: 'ELV-62910',
    orderDate: 'January 28, 2026',
    customerName: 'Alistair Vance',
    customerEmail: 'a.vance@private.lk',
    customerPhone: '077 412 8890',
    customerLocation: 'Colombo 07, Sri Lanka',
    status: 'In Production',
    paymentMethod: 'Mastercard •••• 8842',
    totalLKR: 37000,
    items: [
      {
        id: 1,
        title: 'The Signature Crewneck Tee',
        size: 'L',
        color: 'Onyx Black',
        priceLKR: 18500,
        quantity: 2,
        image: '/images/tshirt_white.webp'
      }
    ]
  },
  {
    orderId: 'ELV-41805',
    orderDate: 'February 2, 2026',
    customerName: 'Senaka De Silva',
    customerEmail: 'senaka.desilva@atelier.lk',
    customerPhone: '071 882 1104',
    customerLocation: 'Kandy, Sri Lanka',
    status: 'Pending Confirmation',
    paymentMethod: 'Bank Transfer (Verified)',
    totalLKR: 24500,
    items: [
      {
        id: 4,
        title: 'Essential Relaxed Fit Tee',
        size: 'M',
        color: 'Ivory Cream',
        priceLKR: 24500,
        quantity: 1,
        image: '/images/tshirt_white.webp'
      }
    ]
  }
];

export const INITIAL_ADMIN_REVIEWS = [
  {
    id: 'rev-101',
    orderId: 'ELV-98421',
    customerName: 'Julian Sterling',
    location: 'Milano / Colombo',
    productTitle: 'The Signature Crewneck Tee',
    rating: 5,
    fitRating: 'True to Size',
    comment: 'The collar ribbing remains crisp with zero sagging. The fabric holds its clean shape without feeling heavy. Outstanding bespoke quality.',
    date: 'October 14, 2025',
    status: 'Approved',
    isFeatured: true
  },
  {
    id: 'rev-102',
    orderId: 'ELV-98421',
    customerName: 'Julian Sterling',
    location: 'Milano / Colombo',
    productTitle: 'Essential Relaxed Fit Tee',
    rating: 5,
    fitRating: 'True to Size',
    comment: 'Exceptional drape and skin-feel. Clean minimalist look for everyday wear.',
    date: 'October 15, 2025',
    status: 'Approved',
    isFeatured: false
  },
  {
    id: 'rev-103',
    orderId: 'ELV-55102',
    customerName: 'Julian Sterling',
    location: 'Milano / Colombo',
    productTitle: 'Minimalist Oversized Tee',
    rating: 5,
    fitRating: 'True to Size',
    comment: 'Structured relaxed silhouette that pairs effortlessly with tailored trousers. Holds its shape flawlessly across the day.',
    date: 'November 5, 2025',
    status: 'Approved',
    isFeatured: true
  },
  {
    id: 'rev-104',
    orderId: 'ELV-77304',
    customerName: 'Marcus Thorne',
    location: 'London, UK',
    productTitle: 'Essential Relaxed Fit Tee',
    rating: 5,
    fitRating: 'True to Size',
    comment: 'Subtle clean sheen that elevates a casual look. Blind hems are flawlessly executed.',
    date: 'December 20, 2025',
    status: 'Approved',
    isFeatured: false
  },
  {
    id: 'rev-105',
    orderId: 'ELV-62910',
    customerName: 'Alistair Vance',
    location: 'Colombo 07',
    productTitle: 'The Signature Crewneck Tee',
    rating: 4,
    fitRating: 'Slightly Relaxed',
    comment: 'Very substantial fabric weight. Great drape. Delivery in Colombo was prompt and beautifully packaged.',
    date: 'February 10, 2026',
    status: 'Pending',
    isFeatured: false
  }
];

export const INITIAL_ADMIN_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Julian Sterling',
    email: 'julian.sterling@private.com',
    phone: '071 909 2726',
    city: 'Colombo',
    tier: 'Private Client',
    totalSpentLKR: 128500,
    totalOrders: 4,
    preferredSize: 'L',
    lastActive: '2 hours ago'
  },
  {
    id: 'cust-2',
    name: 'Marcus Thorne',
    email: 'm.thorne@mayfair.co.uk',
    phone: '+44 7911 123456',
    city: 'London',
    tier: 'Private Client',
    totalSpentLKR: 92000,
    totalOrders: 3,
    preferredSize: 'M',
    lastActive: 'Yesterday'
  },
  {
    id: 'cust-3',
    name: 'Alistair Vance',
    email: 'a.vance@private.lk',
    phone: '077 412 8890',
    city: 'Colombo 07',
    tier: 'Patron',
    totalSpentLKR: 74000,
    totalOrders: 2,
    preferredSize: 'L',
    lastActive: '3 days ago'
  },
  {
    id: 'cust-4',
    name: 'Senaka De Silva',
    email: 'senaka.desilva@atelier.lk',
    phone: '071 882 1104',
    city: 'Kandy',
    tier: 'Patron',
    totalSpentLKR: 24500,
    totalOrders: 1,
    preferredSize: 'M',
    lastActive: 'Today'
  }
];

export const INITIAL_STORE_SETTINGS = {
  brandName: 'ELVANY (PVT) LTD',
  contactEmail: 'elvanywear@gmail.com',
  phonePrimary: '071 909 2726',
  phoneSecondary: '071 252 9942',
  operatingHours: 'Mon – Fri • 9:00 AM – 9:00 PM',
  deliveryTime: '3 – 5 Day Delivery Across Sri Lanka',
  colomboExpressFeeLKR: 0,
  islandwideFeeLKR: 0,
  heroAutoRotateSeconds: 6.5
};
