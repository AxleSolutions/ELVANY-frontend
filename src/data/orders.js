import { PRODUCTS } from './products';

export const INITIAL_ORDERS = [
  {
    orderId: 'ELV-98421',
    customerName: 'Julian Sterling',
    customerLocation: 'Milan, Italy',
    orderDate: 'October 10, 2025',
    status: 'Delivered',
    items: [
      {
        productId: 'prod-01',
        name: 'The 280 GSM Heavyweight Crewneck Tee',
        color: 'Onyx Black',
        selectedSize: 'L (42)',
        priceLKR: 18500,
        image: '/images/hero_tshirt.jpg'
      },
      {
        productId: 'prod-02',
        name: 'Sea Island Long-Staple Luxury Tee',
        color: 'Optic White',
        selectedSize: 'L (42)',
        priceLKR: 22000,
        image: '/images/tshirt_white.jpg'
      }
    ]
  },
  {
    orderId: 'ELV-55102',
    customerName: 'Marcus Vance',
    customerLocation: 'London, UK',
    orderDate: 'November 1, 2025',
    status: 'Delivered',
    items: [
      {
        productId: 'prod-03',
        name: 'Minimalist Boxy Drop-Shoulder Tee',
        color: 'Washed Charcoal',
        selectedSize: 'M (Relaxed)',
        priceLKR: 16500,
        image: '/images/tshirt_oversized.jpg'
      }
    ]
  },
  {
    orderId: 'ELV-77304',
    customerName: 'Elena Rossi',
    customerLocation: 'Florence, Italy',
    orderDate: 'December 15, 2025',
    status: 'Delivered',
    items: [
      {
        productId: 'prod-04',
        name: 'Mercerized Silk-Cotton Luster Tee',
        color: 'Midnight Navy',
        selectedSize: 'M (40)',
        priceLKR: 24000,
        image: '/images/tshirt_silk.jpg'
      }
    ]
  }
];
