import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  orderBy,
  limit,
  setDoc,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order, Poll, Challenge, UserProfile, Design, BlogPost, Discount, WishlistItem } from '../types';

// Generic Handlers
async function getCollection<T>(collectionName: string, queries: any[] = []): Promise<T[]> {
  const ref = collection(db, collectionName);
  const q = query(ref, ...queries);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as T;
  }
  return null;
}

// Product Services
export async function getProducts(onlyPublished = true) {
  const q = onlyPublished 
    ? [where('isPublished', '==', true), orderBy('createdAt', 'desc')]
    : [orderBy('createdAt', 'desc')];
  return getCollection<Product>('products', q);
}

export async function getProductById(id: string) {
  return getDocument<Product>('products', id);
}

// Blog Services
export async function getBlogPosts(onlyPublished = true) {
  const q = onlyPublished
    ? [where('isPublished', '==', true), orderBy('createdAt', 'desc')]
    : [orderBy('createdAt', 'desc')];
  return getCollection<BlogPost>('blog', q);
}

export async function getBlogPostById(id: string) {
  return getDocument<BlogPost>('blog', id);
}

// Order Services
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = collection(db, 'orders');
  return addDoc(ref, {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function getOrdersByUser(userId: string) {
  return getCollection<Order>('orders', [where('userId', '==', userId), orderBy('createdAt', 'desc')]);
}

// Community Poll Services
export async function getActivePolls() {
  return getCollection<Poll>('polls', [where('isActive', '==', true), orderBy('createdAt', 'desc')]);
}

export async function voteInPoll(pollId: string, optionId: string, userId: string) {
  const pollRef = doc(db, 'polls', pollId);
  const poll = await getDocument<Poll>('polls', pollId);
  if (!poll) throw new Error('Poll not found');

  const updatedOptions = poll.options.map(opt => 
    opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
  );

  await updateDoc(pollRef, { options: updatedOptions });
  
  // Award points
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { loyaltyPoints: increment(5) });
}

// Challenge Services
export async function getActiveChallenges() {
  return getCollection<Challenge>('challenges', [where('isActive', '==', true), orderBy('createdAt', 'desc')]);
}

// Design Services
export async function saveDesign(designData: Omit<Design, 'id' | 'createdAt'>) {
  const ref = collection(db, 'designs');
  return addDoc(ref, {
    ...designData,
    createdAt: serverTimestamp()
  });
}

export async function getDesignsByUser(userId: string) {
  return getCollection<Design>('designs', [where('userId', '==', userId), orderBy('createdAt', 'desc')]);
}

export async function getAllDesigns() {
  return getCollection<Design>('designs', [orderBy('createdAt', 'desc')]);
}

// User Services
export async function getUserProfile(uid: string) {
  try {
    const profile = await getDocument<UserProfile>('users', uid);
    if (profile) {
      // Sync local copy
      localStorage.setItem(`user_profile_${uid}`, JSON.stringify(profile));
      return profile;
    }
  } catch (error) {
    console.warn("Failed to retrieve user profile from Firestore. Trying localStorage fallback:", error);
  }
  
  const cached = localStorage.getItem(`user_profile_${uid}`);
  if (cached) {
    try {
      return JSON.parse(cached) as UserProfile;
    } catch {
      return null;
    }
  }
  return null;
}

export async function createUserProfile(profile: UserProfile) {
  // Always update local cache first
  localStorage.setItem(`user_profile_${profile.uid}`, JSON.stringify(profile));
  
  try {
    const ref = doc(db, 'users', profile.uid);
    await setDoc(ref, {
      ...profile,
      joinedAt: serverTimestamp()
    });
  } catch (error) {
    console.warn("Failed to create user profile in Firestore. Reverting to localStorage only:", error);
    // Do not throw so that user registry registration proceeds smoothly
  }
}

export async function getWishlistByUser(userId: string) {
  return getCollection<WishlistItem>('wishlist', [where('userId', '==', userId), orderBy('createdAt', 'desc')]);
}

export async function toggleWishlist(userId: string, productId: string) {
  const wishlist = await getWishlistByUser(userId);
  const existing = wishlist.find(item => item.productId === productId);

  if (existing) {
    const ref = doc(db, 'wishlist', existing.id);
    await deleteDoc(ref);
    return false; // Removed
  } else {
    const ref = collection(db, 'wishlist');
    await addDoc(ref, {
      userId,
      productId,
      createdAt: serverTimestamp()
    });
    return true; // Added
  }
}

// Admin Services
export async function createProduct(productData: Omit<Product, 'id' | 'createdAt'>) {
  const ref = collection(db, 'products');
  const docRef = await addDoc(ref, {
    ...productData,
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...productData, createdAt: new Date() } as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const ref = doc(db, 'products', id);
  return updateDoc(ref, updates);
}

export async function deleteProduct(id: string) {
  const ref = doc(db, 'products', id);
  return deleteDoc(ref);
}

export async function getAllOrders() {
  return getCollection<Order>('orders', [orderBy('createdAt', 'desc')]);
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const ref = doc(db, 'orders', orderId);
  return updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

export async function createBlogPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = collection(db, 'blog');
  return addDoc(ref, {
    ...postData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>) {
  const ref = doc(db, 'blog', id);
  return updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteBlogPost(id: string) {
  const ref = doc(db, 'blog', id);
  return deleteDoc(ref);
}

export async function createPoll(pollData: Omit<Poll, 'id' | 'createdAt'>) {
  const ref = collection(db, 'polls');
  return addDoc(ref, {
    ...pollData,
    createdAt: serverTimestamp()
  });
}

export async function createChallenge(challengeData: Omit<Challenge, 'id' | 'createdAt'>) {
  const ref = collection(db, 'challenges');
  return addDoc(ref, {
    ...challengeData,
    createdAt: serverTimestamp()
  });
}

export async function createDiscount(discountData: Omit<Discount, 'id' | 'createdAt' | 'usageCount'>) {
  const ref = collection(db, 'discounts');
  return addDoc(ref, {
    ...discountData,
    usageCount: 0,
    createdAt: serverTimestamp()
  });
}

export async function getDiscounts() {
  return getCollection<Discount>('discounts', [orderBy('createdAt', 'desc')]);
}

export async function deleteDiscount(id: string) {
  const ref = doc(db, 'discounts', id);
  return deleteDoc(ref);
}

export async function searchContent(searchTerm: string) {
  const term = searchTerm.toLowerCase();
  
  const [products, designs] = await Promise.all([
    getProducts(true),
    getAllDesigns()
  ]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(term) || 
    p.description.toLowerCase().includes(term) ||
    p.category.toLowerCase().includes(term)
  );

  const filteredDesigns = designs.filter(d => 
    (d.name?.toLowerCase().includes(term)) || 
    d.config.layers.some(l => l.content.toLowerCase().includes(term))
  );

  return { products: filteredProducts, designs: filteredDesigns };
}

