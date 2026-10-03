import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { type User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from './firebase';
import { type Product, type OrderDetails, type StorePaymentConfig } from '../types/store';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'settings';
const ADMINS_COLLECTION = 'admins';

export const ADMIN_BOOTSTRAP_EMAIL = 'gmripon703@gmail.com';

export const isUserAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.email === ADMIN_BOOTSTRAP_EMAIL;
};

// --- Orders ---
export const saveOrderToFirestore = async (order: OrderDetails): Promise<void> => {
  const path = `${ORDERS_COLLECTION}/${order.orderId}`;
  try {
    const firestoreOrder = {
      id: order.orderId,
      customerName: order.customer.fullName,
      phone: order.customer.phone,
      address: order.customer.address,
      city: order.customer.city || 'Standard Area',
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: 'pending',
      paymentMethod: order.paymentMethod,
      notes: order.customer.notes || '',
      createdAt: order.createdAt || new Date().toISOString()
    };
    await setDoc(doc(db, ORDERS_COLLECTION, order.orderId), firestoreOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const subscribeToOrders = (
  callback: (orders: OrderDetails[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders: OrderDetails[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          orderId: d.id,
          createdAt: d.createdAt,
          fullDate: new Date(d.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          items: [],
          subtotal: d.subtotal || 0,
          shipping: d.shipping || 0,
          discount: 0,
          total: d.total || 0,
          paymentMethod: d.paymentMethod || 'cod',
          paymentStatus: d.status === 'delivered' ? 'paid_verified' : 'unpaid_cod',
          customer: {
            fullName: d.customerName || 'Anonymous',
            phone: d.phone || '',
            address: d.address || '',
            city: d.city || '',
            notes: d.notes || ''
          },
          status: d.status === 'pending' ? 'confirmed' : (d.status || 'confirmed')
        };
      });
      callback(orders);
    },
    (error) => {
      console.warn('Orders subscription notice (requires admin):', error.message);
      if (onError) onError(error);
    }
  );
};

export const updateOrderStatusInFirestore = async (orderId: string, status: string): Promise<void> => {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const validFirestoreStatus = status === 'confirmed' ? 'pending' : status;
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status: validFirestoreStatus
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// --- Products ---
export const subscribeToProducts = (
  onData: (products: Product[]) => void,
  fallbackProducts: Product[]
) => {
  return onSnapshot(
    collection(db, PRODUCTS_COLLECTION),
    (snapshot) => {
      if (snapshot.empty) {
        onData(fallbackProducts);
        return;
      }
      const fetched: Product[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id,
          name: data.title,
          subtitle: data.description || '',
          price: data.price,
          originalPrice: data.compareAtPrice || data.price * 1.3,
          rating: data.rating || 4.9,
          reviewCount: data.reviewsCount || 100,
          category: (data.category as Product['category']) || 'electronics',
          inStock: (data.stock ?? 10) > 0,
          stockCount: data.stock ?? 10,
          badge: data.tag,
          image: data.image,
          description: data.description || '',
          features: ['Cash on delivery available', 'Fast dispatch within 24h', 'Premium verified quality'],
          specs: { Category: data.category || 'Featured' }
        };
      });
      onData(fetched.length > 0 ? fetched : fallbackProducts);
    },
    (error) => {
      console.warn('Products snapshot notice:', error.message);
      onData(fallbackProducts);
    }
  );
};

export const saveProductToFirestore = async (prod: Product): Promise<void> => {
  const path = `${PRODUCTS_COLLECTION}/${prod.id}`;
  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), {
      id: prod.id,
      title: prod.name,
      price: prod.price,
      compareAtPrice: prod.originalPrice || prod.price,
      rating: prod.rating || 5,
      reviewsCount: prod.reviewCount || 1,
      tag: prod.badge || '',
      category: prod.category || 'electronics',
      image: prod.image,
      description: prod.description || prod.subtitle || '',
      stock: prod.stockCount || 50,
      salesCount: 10,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const deleteProductFromFirestore = async (productId: string): Promise<void> => {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// --- Settings ---
export const saveSettingsToFirestore = async (settings: StorePaymentConfig): Promise<void> => {
  const path = `${SETTINGS_COLLECTION}/global`;
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'global'), {
      storeName: settings.storeName,
      currency: settings.currency,
      shippingFee: settings.shippingFee,
      freeShippingThreshold: settings.freeShippingThreshold,
      phoneSupport: settings.whatsappSupportNumber,
      emailSupport: ADMIN_BOOTSTRAP_EMAIL,
      codNotice: 'Cash on delivery available nationwide'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
