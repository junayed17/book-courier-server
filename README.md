# 📚 BookCourier – Backend (Server)

## 🧾 Project Overview

BookCourier is a Library-to-Home Delivery System that allows users to request books from  libraries and receive them at home.  
This repository contains the backend/server-side implementation of the BookCourier platform.

The backend provides secure REST APIs to manage:

- Users, Librarians, and Admins  
- Books, Orders, Payments, Wishlists, and Reviews  
- Stripe payment processing  
- Firebase JWT–based route protection

---

## 🎯 Purpose of the Server

- Provide secure and scalable REST APIs  
- Store and manage data using MongoDB  
- Handle book orders and delivery status  
- Process online payments using Stripe  
- Protect sensitive routes using Firebase JWT authentication

---

## 🌐 Live Server URL

### 🔗 Production API
👉 https://bookcourierbd.netlify.app

> ⚠️ Note: The server is fully deployed and configured for production with proper CORS, JWT, and environment variable security.

---

## 🧩 Key Features

### 🔐 Authentication & Security

- Firebase JWT token verification  
- Role-based access (User, Librarian, Admin)  
- Protected API routes  
- Environment variable–based credential security

### 📚 Book Management

- Librarians can add, edit, and publish/unpublish books  
- Admin can manage and delete any book  
- Unpublished books are hidden from public listings

### 🛒 Order Management

- Users can place book orders  
- Order status flow: pending → shipped → delivered  
- Pending orders can be canceled  
- Payment status tracked (unpaid / paid)

### 💳 Payment System

- Stripe Checkout integration  
- Secure payment session verification  
- Automatic order update after successful payment  
- Stores transaction ID, payment method, and paid amount

### ❤️ Wishlist & ⭐ Reviews

- Users can add books to wishlist  
- Users can review and rate books they have ordered

### 🔍 Search & Sort

- Search books by name  
- Sort books by price (server-supported)

---

## 🛠️ Technologies & Packages Used

### Backend Stack

- Node.js  
- Express.js  
- MongoDB

### NPM Packages

```json
{
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.2.1",
  "mongodb": "^7.0.0",
  "stripe": "^20.1.0"
}
