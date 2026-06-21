Sela Cafe
Sela Cafe adalah sistem manajemen operasional cafe berbasis microservices yang dirancang untuk mendukung proses pemesanan pelanggan, manajemen menu, operasional dapur, layanan delivery, serta pengelolaan konten website cafe dalam satu ekosistem terintegrasi.
Project ini dibangun menggunakan Java 21, Spring Boot, Spring Security JWT, PostgreSQL, dan arsitektur Microservices untuk memisahkan tanggung jawab setiap layanan sehingga lebih mudah dikembangkan, dipelihara, dan diskalakan.

Fitur Utama
Authentication & Authorization
* Register dan Login menggunakan JWT
* Role-based Access Control
* Manajemen User dan Role

Menu Management
* CRUD Menu
* CRUD Category
* Ketersediaan Menu (Available / Unavailable)
* Integrasi antar service melalui Internal API

Customer Features
* Favorite Menu
* Review Menu
* Riwayat Pemesanan

Dine-In System
* QR Code Table Scan
* Table Session Management
* Status Meja (AVAILABLE / OCCUPIED)
* Pembuatan Order berdasarkan sesi meja

Order Management
* Create Order
* Order Item Management
* Automatic Price Calculation
* Transaction Management (@Transactional)
* Order Status Workflow

Delivery System
* Delivery Order
* Courier Assignment
* Delivery Tracking
* Delivery Completion

Kitchen Operations
* Kitchen Dashboard
* Order Preparation Workflow

Reporting
* Sales Report
* Order Report
* Excel Export


 🏗️ Architecture

Core Service, mengelola:
* Authentication
* User
* Role
* Menu
* Category
* Favorite
* Review

Order Service, mengelola:
* Dining Table
* Table Session
* Order
* Order Item
* Delivery
* Courier
* Kitchen Workflow
  

## 📋 Order Workflow

WAITING_PAYMENT → PAID → PREPARING → READY → COMPLETED

Untuk Delivery:
WAITING_PAYMENT → PAID → PREPARING → READY → ON_DELIVERY → COMPLETED



🛠️ Tech Stack
Backend
* Java 21
* Spring Boot 3
* Spring Security
* Spring Data JPA
* Spring Cloud Gateway
* JWT (JJWT)
* PostgreSQL
* Lombok

Tools
* Maven
* Postman
* Git & GitHub


🎯 Project Goals

Membangun sistem cafe modern yang mendukung:
* Dine In dengan QR Table Ordering
* Delivery Internal Cafe
* Operasional Dapur
* Manajemen Menu
* Dashboard Operasional
* Pelaporan Penjualan

Dengan arsitektur microservices yang scalable dan maintainable.
