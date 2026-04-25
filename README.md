# 🚀 Quotation Management Platform

A production-ready full-stack quotation management system built with **React, TypeScript, and Tailwind CSS**.

Designed to streamline **quote-to-cash workflows** with role-based access control, optimistic UI updates, and intelligent comment threading.

---

## 📌 Features

### 🔐 Authentication & Authorization
- Email & password authentication  
- Mock JWT session (24-hour expiry)  
- Role-based access:
  - Manager
  - Sales Rep
  - Viewer  

---

### 📊 Quotation Management

#### 📋 List View
- Debounced search (300ms)  
- Status filtering (Pending, Approved, Rejected)  
- Pagination support  
- URL-based state  
- Optimistic UI updates  

#### 📄 Detail View
- Full quotation breakdown  
- Inline editing (manager-only)  
- Approve / Reject functionality  
- Auto calculations (subtotal, tax, freight)  

---

### 💬 Comments System
- Threaded comments  
- Nested replies (2 levels)  
- Role-based visibility  
- Lazy loading  

---

### ⚡ Performance
- Debounced search  
- Scroll position preservation  
- Lazy loading  
- Memoized permissions  

---

## 🏗️ Tech Stack

- React  
- TypeScript  
- Tailwind CSS  
- Context API  
- Vite  
- pnpm  

---

## 📂 Project Structure
