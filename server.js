import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import nodemailer from "nodemailer";
import crypto from "crypto";

dotenv.config();

const app = express();
const port = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.use(cors());
app.use(express.json());
app.use("/images", express.static("public/images/store"));

// Create the upload directory if it doesn't exist
const uploadDir = "public/images/store";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/store/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."), false);
    }
  },
});

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db;

// Create admin collection if it doesn't exist
async function createAdminCollection() {
  try {
    await db.createCollection("admins");
    console.log("Admins collection created");
  } catch (error) {
    if (error.code !== 48) {
      // 48 is the error code for "collection already exists"
      console.error("Error creating admins collection:", error);
    }
  }
}

async function connectToDb() {
  try {
    await client.connect();
    db = client.db("store");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
  }
}

// Add the reCAPTCHA verification function
async function verifyRecaptcha(token) {
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: "6LfhjNMqAAAAAKlSRaIuGXcuw2nZ2MHOUoqWwzXr",
          response: token,
        },
      }
    );

    return response.data.success && response.data.score >= 0.5;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

// Function to send welcome email
async function sendWelcomeEmail(email, name) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome back to TechMart!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome back, ${name}!</h2>
          <p>We're glad to see you again at TechMart. Happy shopping!</p>
          <p>Best regards,<br>The TechMart Team</p>
        </div>
      `,
    });
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

connectToDb().then(() => {
  createAdminCollection();
});

// Admin Authentication Routes
app.post("/api/admin/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if admin already exists
    const existingAdmin = await db.collection("admins").findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const admin = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: new Date(),
    };

    const result = await db.collection("admins").insertOne(admin);

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertedId, email, firstName, lastName, isAdmin: true },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from admin object before sending response
    delete admin.password;

    res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        ...admin,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).json({ message: "Error creating admin account" });
  }
});

app.post("/api/admin/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await db.collection("admins").findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        isAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from admin object before sending response
    delete admin.password;

    res.json({
      token,
      user: {
        ...admin,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Admin signin error:", error);
    res.status(500).json({ message: "Error signing in" });
  }
});

// User Authentication Routes
app.post("/api/signup", async (req, res) => {
  try {
    const { recaptchaToken, ...userData } = req.body;

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // Check if user already exists
    const existingUser = await db
      .collection("users")
      .findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = {
      ...userData,
      password: hashedPassword,
      verificationToken,
      tokenExpiry,
      isVerified: false,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);

    // Send verification email
    const verificationUrl = `http://localhost:5000/api/verify/${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: "Verify your TechMart account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to TechMart!</h2>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Verify Email
          </a>
          <p>If the button doesn't work, you can also click this link:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The TechMart Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Add new verification endpoint
app.get("/api/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await db.collection("users").findOne({
      verificationToken: token,
      tokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { verificationToken: "", tokenExpiry: "" },
      }
    );

    // Redirect to sign-in page with success message
    res.redirect("http://localhost:5173/admin/signin?verified=true");
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Error verifying email" });
  }
});

// Modify the signin endpoint to check for verification
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    // Find user
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before signing in" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from user object before sending response
    delete user.password;
    delete user.verificationToken;
    delete user.tokenExpiry;

    res.json({
      token,
      user,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Error signing in" });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await db.collection("products").find({}).toArray();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      price,
      discount,
      description,
      quantity,
      merchantId,
      merchantName,
    } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    const product = {
      name,
      price: Number(price),
      discount: Number(discount),
      description,
      quantity: Number(quantity),
      imagePath,
      merchantId,
      merchantName,
      status: "pending",
      createdAt: new Date(), // Add creation timestamp
    };

    const result = await db.collection("products").insertOne(product);
    const newProduct = { ...product, _id: result.insertedId };
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Error adding product" });
  }
});

app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file) {
      updates.imagePath = `/images/${req.file.filename}`;

      // Delete old image if it exists
      const oldProduct = await db
        .collection("products")
        .findOne({ _id: new ObjectId(id) });
      if (oldProduct?.imagePath) {
        const oldImagePath = path.join("public", oldProduct.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Convert numeric fields
    if (updates.price) updates.price = Number(updates.price);
    if (updates.discount) updates.discount = Number(updates.discount);
    if (updates.quantity) updates.quantity = Number(updates.quantity);

    const result = await db
      .collection("products")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});

app.put("/api/products/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status } });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product status updated successfully" });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({ message: "Error updating product status" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Get the product to delete its image
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });
    if (product?.imagePath) {
      const imagePath = path.join("public", product.imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully", id });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

// Add these new cart endpoints after your existing endpoints
app.post("/api/cart", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Check if cart exists for user
    let cart = await db.collection("carts").findOne({ userId });

    if (cart) {
      // Check if product exists in cart
      const existingProduct = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingProduct) {
        // Update quantity if product exists
        await db.collection("carts").updateOne(
          {
            userId,
            "items.productId": new ObjectId(productId),
          },
          {
            $inc: { "items.$.quantity": quantity },
          }
        );
      } else {
        // Add new product to cart
        await db.collection("carts").updateOne(
          { userId },
          {
            $push: {
              items: {
                productId: new ObjectId(productId),
                quantity,
              },
            },
          }
        );
      }
    } else {
      // Create new cart
      await db.collection("carts").insertOne({
        userId,
        items: [
          {
            productId: new ObjectId(productId),
            quantity,
          },
        ],
        createdAt: new Date(),
      });
    }

    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Error updating cart" });
  }
});

app.get("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await db.collection("carts").findOne({ userId });

    if (!cart) {
      return res.json({ items: [] });
    }

    // Get product details for each item in cart
    const productIds = cart.items.map((item) => new ObjectId(item.productId));
    const products = await db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray();

    // Combine product details with cart quantities
    const cartItems = cart.items.map((cartItem) => {
      const product = products.find(
        (p) => p._id.toString() === cartItem.productId.toString()
      );
      return {
        ...product,
        cartQuantity: cartItem.quantity,
      };
    });

    res.json({ items: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

app.delete("/api/cart/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    await db.collection("carts").updateOne(
      { userId },
      {
        $pull: {
          items: { productId: new ObjectId(productId) },
        },
      }
    );

    res.json({ message: "Product removed from cart" });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Error removing product from cart" });
  }
});

app.put("/api/cart/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    await db.collection("carts").updateOne(
      {
        userId,
        "items.productId": new ObjectId(productId),
      },
      {
        $set: { "items.$.quantity": quantity },
      }
    );

    res.json({ message: "Cart quantity updated" });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: "Error updating cart quantity" });
  }
});

app.post("/api/merchant/register", async (req, res) => {
  try {
    const {
      businessName,
      email,
      password,
      phone,
      address,
      businessType,
      description,
      panCard,
      aadharCard,
      gstin,
    } = req.body;

    // Check if merchant already exists
    const existingMerchant = await db
      .collection("merchants")
      .findOne({ email });
    if (existingMerchant) {
      return res.status(400).json({ message: "Merchant already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new merchant
    const merchant = {
      businessName,
      email,
      password: hashedPassword,
      phone,
      address,
      businessType,
      description,
      panCard,
      aadharCard,
      gstin,
      createdAt: new Date(),
    };

    const result = await db.collection("merchants").insertOne(merchant);

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertedId, email, businessName, isMerchant: true },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from merchant object before sending response
    delete merchant.password;

    res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        ...merchant,
        isMerchant: true,
      },
    });
  } catch (error) {
    console.error("Merchant registration error:", error);
    res.status(500).json({ message: "Error creating merchant account" });
  }
});

app.post("/api/merchant/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find merchant
    const merchant = await db.collection("merchants").findOne({ email });
    if (!merchant) {
      return res.status(400).json({ message: "Merchant not found" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, merchant.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: merchant._id,
        email: merchant.email,
        businessName: merchant.businessName,
        isMerchant: true,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from merchant object before sending response
    delete merchant.password;

    res.json({
      token,
      user: {
        ...merchant,
        isMerchant: true,
      },
    });
  } catch (error) {
    console.error("Merchant login error:", error);
    res.status(500).json({ message: "Error signing in" });
  }
});

// Add these routes after your existing merchant routes

// Get all merchants
app.get("/api/merchant/list", async (req, res) => {
  try {
    const merchants = await db.collection("merchants").find({}).toArray();
    res.json(merchants);
  } catch (error) {
    console.error("Error fetching merchants:", error);
    res.status(500).json({ message: "Error fetching merchants" });
  }
});

app.delete("/api/merchant/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid merchant ID" });
    }

    const result = await db.collection("merchants").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    res.json({ message: "Merchant deleted successfully", id });
  } catch (error) {
    console.error("Error deleting merchant:", error);
    res.status(500).json({ message: "Error deleting merchant" });
  }
});

// Update merchant status
app.put("/api/merchant/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid merchant ID" });
    }

    const result = await db
      .collection("merchants")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status } },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating merchant status:", error);
    res.status(500).json({ message: "Error updating merchant status" });
  }
});

// Update merchant details
app.put("/api/merchant/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid merchant ID" });
    }

    const result = await db
      .collection("merchants")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating merchant:", error);
    res.status(500).json({ message: "Error updating merchant" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await db.collection("products").findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product" });
  }
});

app.delete("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    await db.collection("carts").deleteOne({ userId });

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Error clearing cart" });
  }
});

// Create a transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const {
      userId,
      items,
      totalAmount,
      paymentMethod,
      paymentId,
      status = "completed",
    } = req.body;

    const transaction = {
      userId,
      items,
      totalAmount,
      paymentMethod,
      paymentId,
      status,
      date: new Date(),
    };

    const result = await db.collection("transactions").insertOne(transaction);
    res.status(201).json({ ...transaction, _id: result.insertedId });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Error creating transaction" });
  }
});

// Get user's transaction history
app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await db
      .collection("transactions")
      .find({ userId })
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .toArray();

    // For each transaction, get the full product details for each item
    const transactionsWithProducts = await Promise.all(
      transactions.map(async (transaction) => {
        const itemsWithDetails = await Promise.all(
          transaction.items.map(async (item) => {
            const product = await db
              .collection("products")
              .findOne({ _id: new ObjectId(item.productId) });
            return {
              ...product,
              quantity: item.quantity,
              _id: item.productId,
            };
          })
        );

        return {
          ...transaction,
          items: itemsWithDetails,
        };
      })
    );

    res.json(transactionsWithProducts);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// Get merchant's customer transactions
app.get("/api/merchant/:merchantId/customers", async (req, res) => {
  try {
    const { merchantId } = req.params;

    // Get all transactions
    const allTransactions = await db
      .collection("transactions")
      .find({})
      .sort({ date: -1 })
      .toArray();

    // Filter transactions that contain products from this merchant
    const merchantTransactions = [];
    
    for (const transaction of allTransactions) {
      const itemsWithDetails = await Promise.all(
        transaction.items.map(async (item) => {
          const product = await db
            .collection("products")
            .findOne({ _id: new ObjectId(item.productId) });
          return {
            ...product,
            quantity: item.quantity,
            _id: item.productId,
          };
        })
      );
      
      // Check if any product in this transaction belongs to the merchant
      const merchantItems = itemsWithDetails.filter(
        item => item && item.merchantId === merchantId
      );
      
      if (merchantItems.length > 0) {
        // Get customer details
        const customer = await db
          .collection("users")
          .findOne({ _id: new ObjectId(transaction.userId) });
        
        if (customer) {
          // Remove sensitive information
          delete customer.password;
          delete customer.verificationToken;
          delete customer.tokenExpiry;
          
          merchantTransactions.push({
            ...transaction,
            items: merchantItems, // Only include merchant's items
            customer: customer
          });
        }
      }
    }

    res.json(merchantTransactions);
  } catch (error) {
    console.error("Error fetching merchant customers:", error);
    res.status(500).json({ message: "Error fetching merchant customers" });
  }
});

// Update transaction status
app.put("/api/transactions/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const result = await db
      .collection("transactions")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status } },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating transaction status:", error);
    res.status(500).json({ message: "Error updating transaction status" });
  }
});

// Modify your existing checkout/payment success handlers to create transactions

// Update the successful payment handler in your Razorpay implementation
const handleRazorpaySuccess = async (userId, paymentId, items, totalAmount) => {
  try {
    await db.collection("transactions").insertOne({
      userId,
      items,
      totalAmount,
      paymentMethod: "razorpay",
      paymentId,
      status: "completed",
      date: new Date(),
    });
  } catch (error) {
    console.error("Error creating transaction record:", error);
  }
};

// Update the successful payment handler in your PayPal implementation
const handlePayPalSuccess = async (userId, paymentId, items, totalAmount) => {
  try {
    await db.collection("transactions").insertOne({
      userId,
      items,
      totalAmount,
      paymentMethod: "paypal",
      paymentId,
      status: "completed",
      date: new Date(),
    });
  } catch (error) {
    console.error("Error creating transaction record:", error);
  }
};

// Modify the send-order-confirmation endpoint to also notify merchants
app.post('/api/send-order-confirmation', async (req, res) => {
  try {
    const {
      to,
      subject,
      orderId,
      items,
      totalAmount,
      customerName,
      shippingAddress,
      paymentMethod
    } = req.body;

    // Group items by merchant
    const merchantItems = {};
    for (const item of items) {
      if (!merchantItems[item.merchantId]) {
        merchantItems[item.merchantId] = [];
      }
      merchantItems[item.merchantId].push(item);
    }

    // Create and send customer email
    const customerItemsList = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          ${item.name}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
          ${item.cartQuantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">
          $${(item.price * (1 - item.discount / 100)).toFixed(2)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">
          $${(item.price * (1 - item.discount / 100) * item.cartQuantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">TechMart</h1>
          <p style="color: #64748b; margin-top: 5px;">Order Confirmation</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">Thank you for your purchase!</h2>
          <p style="color: #64748b;">Hello ${customerName},</p>
          <p style="color: #64748b;">Your order has been confirmed and will be shipped soon.</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-bottom: 10px;">Order Details</h3>
          <p style="color: #64748b; margin: 5px 0;">Order ID: ${orderId}</p>
          <p style="color: #64748b; margin: 5px 0;">Payment Method: ${paymentMethod}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${customerItemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total Amount:</td>
              <td style="padding: 12px; text-align: right; font-weight: bold;">$${totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-bottom: 10px;">Shipping Address</h3>
          <p style="color: #64748b; white-space: pre-line;">${shippingAddress}</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; margin-bottom: 10px;">If you have any questions, please contact our support team.</p>
          <p style="color: #64748b; margin: 0;">Thank you for shopping with TechMart!</p>
        </div>
      </div>
    `;

    // Send customer email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: customerEmailHtml
    });

    // Send notification emails to merchants
    for (const merchantId in merchantItems) {
      try {
        // Get merchant details from database
        const merchant = await db.collection("merchants").findOne({ _id: new ObjectId(merchantId) });
        if (!merchant) continue;

        const merchantItemsList = merchantItems[merchantId].map(item => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
              ${item.name}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
              ${item.cartQuantity}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">
              $${(item.price * (1 - item.discount / 100)).toFixed(2)}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">
              $${(item.price * (1 - item.discount / 100) * item.cartQuantity).toFixed(2)}
            </td>
          </tr>
        `).join('');

        const merchantTotal = merchantItems[merchantId].reduce((sum, item) => 
          sum + (item.price * (1 - item.discount / 100) * item.cartQuantity), 0
        );

        const merchantEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">TechMart</h1>
              <p style="color: #64748b; margin-top: 5px;">New Order Notification</p>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e293b; margin-top: 0;">New Order Received!</h2>
              <p style="color: #64748b;">Hello ${merchant.businessName},</p>
              <p style="color: #64748b;">You have received a new order from ${customerName}.</p>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #1e293b; margin-bottom: 10px;">Order Details</h3>
              <p style="color: #64748b; margin: 5px 0;">Order ID: ${orderId}</p>
              <p style="color: #64748b; margin: 5px 0;">Order Date: ${new Date().toLocaleDateString()}</p>
              <p style="color: #64748b; margin: 5px 0;">Customer: ${customerName}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${merchantItemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 12px; text-align: right; font-weight: bold;">$${merchantTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #1e293b; margin-bottom: 10px;">Shipping Address</h3>
              <p style="color: #64748b; white-space: pre-line;">${shippingAddress}</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin-bottom: 10px;">Please process this order as soon as possible.</p>
              <p style="color: #64748b; margin: 0;">Thank you for being a valued merchant on TechMart!</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: merchant.email,
          subject: `New Order Received - Order #${orderId}`,
          html: merchantEmailHtml
        });
      } catch (error) {
        console.error(`Error sending email to merchant ${merchantId}:`, error);
      }
    }

    res.json({ message: 'Order confirmation emails sent successfully' });
  } catch (error) {
    console.error('Error sending order confirmation emails:', error);
    res.status(500).json({ message: 'Error sending order confirmation emails' });
  }
});

// Coupon Routes
app.post("/api/coupons", async (req, res) => {
  try {
    const {
      code,
      discountPercentage,
      expiryDate,
      description,
      merchantId,
      merchantName,
      isActive
    } = req.body;

    const coupon = {
      code,
      discountPercentage: Number(discountPercentage),
      expiryDate: new Date(expiryDate),
      description,
      merchantId,
      merchantName,
      isUsed: false,
      isActive: isActive || true,
      createdAt: new Date()
    };

    const result = await db.collection("coupons").insertOne(coupon);
    res.status(201).json({ ...coupon, _id: result.insertedId });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ message: "Error creating coupon" });
  }
});

app.get("/api/coupons/merchant/:merchantId", async (req, res) => {
  try {
    const { merchantId } = req.params;
    const coupons = await db.collection("coupons")
      .find({ merchantId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(coupons);
  } catch (error) {
    console.error("Error fetching merchant coupons:", error);
    res.status(500).json({ message: "Error fetching coupons" });
  }
});

app.get("/api/coupons/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await db.collection("coupons").findOne({ 
      code, 
      isUsed: false,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found or expired" });
    }
    
    res.json(coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({ message: "Error fetching coupon" });
  }
});

app.put("/api/coupons/:id/use", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid coupon ID" });
    }
    
    const result = await db.collection("coupons").findOneAndUpdate(
      { _id: new ObjectId(id), isUsed: false, isActive: true, expiryDate: { $gt: new Date() } },
      { $set: { isUsed: true, usedAt: new Date() } },
      { returnDocument: "after" }
    );
    
    if (!result) {
      return res.status(404).json({ message: "Coupon not found, already used, or expired" });
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error using coupon:", error);
    res.status(500).json({ message: "Error using coupon" });
  }
});

app.delete("/api/coupons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid coupon ID" });
    }
    
    const result = await db.collection("coupons").deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ message: "Error deleting coupon" });
  }
});

// Add this to the checkout process
app.post("/api/checkout/apply-coupon", async (req, res) => {
  try {
    const { code, userId } = req.body;
    
    const coupon = await db.collection("coupons").findOne({ 
      code, 
      isUsed: false,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    
    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon" });
    }
    
    res.json({ 
      couponId: coupon._id,
      discountPercentage: coupon.discountPercentage,
      merchantId: coupon.merchantId
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ message: "Error applying coupon" });
  }
});

// Send coupon to selected customers
app.post('/api/coupons/send', async (req, res) => {
  try {
    const { couponId, customerIds } = req.body;

    // Validate couponId and customerIds
    if (!ObjectId.isValid(couponId) || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: "Invalid coupon ID or customer IDs" });
    }

    // Fetch the coupon details
    const coupon = await db.collection("coupons").findOne({ _id: new ObjectId(couponId) });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Fetch the customer details
    const customers = await db.collection("users").find({ _id: { $in: customerIds.map(id => new ObjectId(id)) } }).toArray();
    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }

    // Send the coupon to each customer via email
    for (const customer of customers) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customer.email,
        subject: `You've received a coupon from ${coupon.merchantName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Hello ${customer.firstName} ${customer.lastName},</h2>
            <p>You've received a coupon from ${coupon.merchantName}!</p>
            <p>Coupon Code: <strong>${coupon.code}</strong></p>
            <p>Discount: <strong>${coupon.discountPercentage}% off</strong></p>
            <p>Expires on: <strong>${new Date(coupon.expiryDate).toLocaleDateString()}</strong></p>
            <p>Description: ${coupon.description}</p>
            <p>Use this coupon at checkout to avail the discount.</p>
            <p>Best regards,<br>The TechMart Team</p>
          </div>
        `
      });
    }

    res.json({ message: "Coupon sent to selected customers successfully" });
  } catch (error) {
    console.error("Error sending coupon:", error);
    res.status(500).json({ message: "Error sending coupon" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
