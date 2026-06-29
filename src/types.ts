export type ProductCategory = 'Streetwear' | 'Minimal' | 'Luxury' | 'Athleisure' | 'Seasonal' | 'Collaborations' | 'Limited Edition';

export type ProductType = 
  | 'Short Sleeve T-Shirt'
  | 'Oversized T-Shirt'
  | 'Long Sleeve'
  | 'Sleeveless Shirt'
  | 'Tank Top'
  | 'Polo'
  | 'Hoodie'
  | 'Zip Hoodie'
  | 'Sweatshirt'
  | 'Joggers'
  | 'Cargo Pants'
  | 'Shorts'
  | 'Arm Sleeves'
  | 'Face Cap'
  | 'Baseball Cap'
  | 'Bucket Hat'
  | 'Beanie'
  | 'Head Warmer'
  | 'Phone Case'
  | 'Tote Bag'
  | 'Backpack'
  | 'Socks'
  | 'Water Bottle'
  | 'Mouse Pad'
  | 'Laptop Sleeve';

export type PrintingMethod = 'DTG' | 'DTF' | 'Screen Print' | 'Heat Transfer' | 'Embroidery' | 'Premium Embroidery';
export type QualityTier = 'Standard' | 'Premium' | 'Luxury';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  type: ProductType;
  basePrice: number;
  images: string[];
  colors: string[];
  sizes: string[];
  isOfficial: boolean;
  isPublished: boolean;
  stock: number;
  printingMethods?: PrintingMethod[];
  materials?: string[];
  createdAt?: any;
}

export interface DesignConfig {
  layers: {
    id: string;
    type: 'image' | 'text';
    content: string; 
    position: { x: number; y: number };
    scale: number;
    rotation: number;
    color?: string;
    font?: string;
    opacity?: number;
    zIndex: number;
  }[];
  baseColor: string;
  logoPlacement: 'Large' | 'Chest' | 'Sleeve' | 'Back' | 'Inside' | 'None';
  printMethod: PrintingMethod;
  quality: QualityTier;
}

export interface Design {
  id: string;
  userId: string;
  name?: string;
  baseProductId: string;
  config: DesignConfig;
  previewUrl: string;
  isPublic: boolean;
  createdAt: any;
}

export interface OrderItem {
  type: 'custom' | 'official';
  productId: string;
  designId?: string;
  quantity: number;
  price: number;
  options: {
    size: string;
    color: string;
    quality: QualityTier;
    printMethod: PrintingMethod;
    layers?: any[];
  };
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'Received' | 'Approved' | 'Printing' | 'Embroidery' | 'Inspection' | 'Packaging' | 'Shipped' | 'Delivered';
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    zip: string;
    country: string;
    phone?: string;
  };
  trackingNumber?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  photos?: string[];
  videos?: string[];
  fitFeedback: 'Too Small' | 'Perfect' | 'Too Large';
  materialFeedback: number;
  printingQuality: number;
  isVerified: boolean;
  createdAt: any;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: { 
    id: string; 
    label: string; 
    image?: string; 
    votes: number; 
  }[];
  isActive: boolean;
  endsAt: any;
  createdAt: any;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  endsAt: any;
  isActive: boolean;
  thumbnail?: string;
  createdAt: any;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  designId: string;
  votes: number;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  loyaltyPoints: number;
  wishlist: string[];
  savedDesigns: string[];
  birthday?: string;
  joinedAt: any;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: 'Purchase' | 'Review' | 'Voting' | 'Referral' | 'Birthday' | 'Challenge';
  createdAt: any;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image?: string;
  isPublished: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: any;
  endDate: any;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
  createdAt: any;
}

export interface CartItem extends OrderItem {
  cartId: string;
  productName: string;
  productImage: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: any;
}

