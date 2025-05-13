import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  reviews, type Review, type InsertReview 
} from "@shared/schema";
import session from "express-session";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getNewProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Order item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Review methods
  getReviewsByProduct(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Add sample products when the table is empty
    this.populateSampleProductsIfEmpty();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isFeatured, true));
  }
  
  async getNewProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isNew, true));
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }
  
  async updateProduct(id: number, partialProduct: Partial<InsertProduct>): Promise<Product | undefined> {
    // Check if product exists
    const productExists = await this.getProduct(id);
    if (!productExists) return undefined;
    
    const [updatedProduct] = await db
      .update(products)
      .set(partialProduct)
      .where(eq(products.id, id))
      .returning();
    
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return !!result;
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.id));
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.id));
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }
  
  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(insertOrderItem)
      .returning();
    
    return orderItem;
  }
  
  // Review methods
  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.id));
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    // Insert the review
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    
    // Update product rating
    const productReviews = await this.getReviewsByProduct(insertReview.productId);
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / productReviews.length;
    
    await this.updateProduct(insertReview.productId, {
      rating: averageRating,
      reviewCount: productReviews.length
    });
    
    return review;
  }

  // Populate sample products if the products table is empty
  private async populateSampleProductsIfEmpty() {
    const existingProducts = await db.select().from(products);
    
    if (existingProducts.length === 0) {
      const sampleProducts: InsertProduct[] = [
        {
          name: "Smartphone X12 Pro",
          description: "High-performance smartphone with advanced camera system and all-day battery.",
          price: 699.99,
          discountPrice: 799.99,
          imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
          category: "Electronics",
          inStock: true,
          isNew: true,
          isFeatured: true,
          rating: 4.5,
          reviewCount: 128
        },
        {
          name: "Premium Wireless Headphones",
          description: "Noise-cancelling wireless headphones with high-fidelity sound and comfortable fit.",
          price: 129.99,
          discountPrice: 179.99,
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
          category: "Electronics",
          inStock: true,
          isNew: false,
          isFeatured: true,
          rating: 4.0,
          reviewCount: 93
        },
        {
          name: "SmartWatch Series 5",
          description: "Track your fitness, monitor health metrics, and stay connected with this advanced smartwatch.",
          price: 249.99,
          discountPrice: 299.99,
          imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
          category: "Electronics",
          inStock: true,
          isNew: false,
          isFeatured: true,
          rating: 5.0,
          reviewCount: 214
        },
        {
          name: "Athletic Running Shoes",
          description: "Lightweight, comfortable running shoes with excellent support and durability.",
          price: 89.99,
          discountPrice: 119.99,
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
          category: "Fashion",
          inStock: true,
          isNew: false,
          isFeatured: true,
          rating: 4.0,
          reviewCount: 76
        },
        {
          name: "Portable Bluetooth Speaker",
          description: "Immersive 360° sound with 20 hours of battery life. Waterproof and dustproof design.",
          price: 79.99,
          discountPrice: null,
          imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
          category: "Electronics",
          inStock: true,
          isNew: true,
          isFeatured: false,
          rating: 4.0,
          reviewCount: 42
        },
        {
          name: "Ergonomic Laptop Stand",
          description: "Aluminum laptop stand improves posture, reduces neck strain, and enhances airflow.",
          price: 49.99,
          discountPrice: null,
          imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
          category: "Home",
          inStock: true,
          isNew: true,
          isFeatured: false,
          rating: 4.5,
          reviewCount: 18
        },
        {
          name: "LED Desk Lamp",
          description: "Adjustable desk lamp with 5 color modes and 7 brightness levels. USB charging port included.",
          price: 39.99,
          discountPrice: null,
          imageUrl: "https://www.salonequipmentcentre.com/cdn/shop/articles/shutterstock_1779193125_5.jpg?v=1684747385",
          category: "Home",
          inStock: true,
          isNew: true,
          isFeatured: false,
          rating: 4.0,
          reviewCount: 31
        },
        {
          name: "Smart Coffee Maker",
          description: "Wi-Fi connected coffee maker. Schedule and customize brewing from your smartphone.",
          price: 129.99,
          discountPrice: null,
          imageUrl: "https://images.unsplash.com/photo-1608354580875-30bd4168b351?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
          category: "Home",
          inStock: true,
          isNew: true,
          isFeatured: false,
          rating: 3.5,
          reviewCount: 24
        }
      ];
      
      // Insert all sample products
      for (const product of sampleProducts) {
        await this.createProduct(product);
      }
    }
  }
}

export const storage = new DatabaseStorage();
