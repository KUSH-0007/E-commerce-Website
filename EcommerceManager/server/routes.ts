import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProductSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertReviewSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/new", async (req, res) => {
    try {
      const products = await storage.getNewProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch new products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Admin product management routes (protected)
  app.post("/api/products", async (req, res) => {
    try {
      // Check for admin privileges
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return res.status(400).json({ message: "Invalid product data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      // Check for admin privileges
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const productId = parseInt(req.params.id);
      const productData = req.body;
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (err) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      // Check for admin privileges
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const productId = parseInt(req.params.id);
      const success = await storage.deleteProduct(productId);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user.id,
        createdAt: new Date().toISOString(),
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const items = req.body.items;
      if (Array.isArray(items)) {
        for (const item of items) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          });
        }
      }
      
      res.status(201).json(order);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return res.status(400).json({ message: "Invalid order data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      if (req.user.isAdmin) {
        // Admin can see all orders
        const orders = await storage.getOrders();
        return res.json(orders);
      } else {
        // Regular users can only see their own orders
        const orders = await storage.getOrdersByUser(req.user.id);
        return res.json(orders);
      }
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the order belongs to the user or user is admin
      if (order.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(orderId);
      
      res.json({ ...order, items: orderItems });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Reviews routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByProduct(productId);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId,
        userId: req.user.id,
        username: req.user.username,
        createdAt: new Date().toISOString(),
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return res.status(400).json({ message: "Invalid review data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
