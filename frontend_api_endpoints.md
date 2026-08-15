# ADMS Syariah API Endpoint Documentation for Frontend

This document outlines all the available API endpoints generated across all controllers, grouped by domain and role permissions.

---

## 1. Authentication & Account Recovery (Rate-Limited: 10 requests/min)
No authorization headers are required for these endpoints.

| Method | Endpoint Path | Description | Key Payload Fields |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Register new account. Sends a verification email. | `name`, `email`, `phone`, `password`, `password_confirmation`, `role` (user/merchant) |
| `POST` | `/api/verify-email` | Verify email address using the 6-digit email token. | `email`, `token` |
| `POST` | `/api/login` | Login and obtain custom bearer token. | `email` (or `phone`), `password` |
| `POST` | `/api/forgot-password` | Request password reset token to email. | `email` |
| `POST` | `/api/reset-password` | Submit new password using reset token. | `email`, `token`, `password`, `password_confirmation` |

---

## 2. Customer Features
Requires Header: `Authorization: Bearer <token>`

### Profil & Toko
| Method | Endpoint Path | Description | Key Payload / Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/me` | Get currently logged in user profile. | Response: User data object |
| `POST` | `/api/logout` | Revoke active bearer token. | N/A |
| `PUT` | `/api/customer/profile` | Update profile information (name, phone, password). | `name`, `phone`, `password`, `password_confirmation` (optional) |
| `POST` | `/api/customer/profile/avatar` | Upload profile photo (polymorphic media). | `avatar` (File upload) |
| `POST` | `/api/customer/merchant/register` | Customer applies to register a merchant store. | `name`, `slug`, `description`, `location`, `contact_whatsapp`, `syariah_certified` (boolean) |

### Wishlist & Keranjang Belanja (Cart)
| Method | Endpoint Path | Description | Key Payload / Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customer/wishlist` | Fetch wishlist products and advertisements. | N/A |
| `POST` | `/api/customer/wishlist/toggle` | Toggle item in wishlist (add/remove). | `product_id` OR `advertisement_id` |
| `GET` | `/api/customer/cart` | Get list of items in the shopping cart. | N/A |
| `POST` | `/api/customer/cart` | Add a product to the cart (increments if exists). | `product_id`, `quantity` |
| `DELETE` | `/api/customer/cart/{id}` | Delete item from cart by cart item ID. | N/A |

### Pesanan, Unduhan & Ulasan
| Method | Endpoint Path | Description | Key Payload / Response |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/customer/orders` | Checkout cart items, items list, or single item. | `merchant_id`, `payment_method`, `checkout_from_cart` (boolean) OR `items` array |
| `GET` | `/api/customer/orders` | Fetch customer purchase order history. | N/A |
| `GET` | `/api/customer/orders/{id}` | Get specific order detail and items status. | N/A |
| `GET` | `/api/customer/orders/items/{id}/download` | Stream download of paid digital assets. | Verifies payment status and ownership. |
| `POST` | `/api/customer/reviews` | Write review. Only allowed if product was paid/completed. | `product_id`, `rating` (1-5), `comment` |

### Iklan Mandiri
| Method | Endpoint Path | Description | Key Payload / Response |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/customer/ads` | Post classified advertisement (max 2 images free). | `title`, `category_id`, `description`, `price`, `location`, `whatsapp`, `images` (array of files) |
| `POST` | `/api/customer/ads/{id}/upgrade` | Upgrade ad to a premium package. | `package_id` |

---

## 3. Merchant Features
Requires Header: `Authorization: Bearer <token>` AND user role is `merchant` or `admin`, with store verified.

### Profil & Pengaturan Toko
| Method | Endpoint Path | Description | Key Payload / Response |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/merchant/register` | Open new store (if none exist for user). | `name`, `slug`, `description`, `location`, `contact_whatsapp` |
| `POST` | `/api/merchant/store/update` | Update store metadata, logo, and banner. | `name`, `description`, `location`, `logo` (File), `banner` (File) |
| `POST` | `/api/merchant/store/toggle` | Toggle store active status (open/close). | Toggles verified/active status. |

### Produk & Iklan Toko
| Method | Endpoint Path | Description | Key Payload / Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/merchant/products` | Get products with search and category filters. | Query parameters: `search`, `category_id` |
| `POST` | `/api/merchant/products` | Upload new digital product (status: pending admin). | `title`, `slug`, `category_id`, `price`, `price_type`, `stock`, `thumbnail` (File) |
| `PUT` | `/api/merchant/products/{id}` | Update product specifications and details. | Same as POST (except thumbnail is optional) |
| `DELETE` | `/api/merchant/products/{id}` | Soft delete product. | N/A |
| `GET` | `/api/merchant/ads` | Fetch store classified ads. | N/A |
| `POST` | `/api/merchant/ads` | Post store ad with selected package. | `title`, `category_id`, `description`, `package_id`, `images` (Array) |
| `GET` | `/api/merchant/ads/{id}/stats` | Fetch performance stats (views, clicks). | Response: `views_count`, `clicks_count` |

### Keuangan & Pesanan Toko
| Method | Endpoint Path | Description | Key Payload / Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/merchant/orders` | Fetch incoming orders with status/payment filters. | Query parameters: `status`, `payment_status` |
| `PUT` | `/api/merchant/orders/{id}/status` | Process order status transitions. | `status` (pending, paid, processed, completed, dsb) |
| `POST` | `/api/merchant/withdrawals` | Apply for payout. Enforces dynamic balance check. | `amount`, `bank_name`, `bank_account_name`, `bank_account_number` |
| `GET` | `/api/merchant/dashboard` | Get revenues, pending counts, and recent reviews. | N/A |

---

## 4. Admin Management & Moderation Features
Requires Header: `Authorization: Bearer <token>` AND user role is `admin`.

| Method | Endpoint Path | Description | Key Payload / Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | List users with search, role, and status filters. | Query parameters: `role`, `status`, `search` |
| `POST` | `/api/admin/users/{id}/toggle-status` | Suspend or unsuspend account. Logs action. | `reason` (required when suspending) |
| `GET` | `/api/admin/merchants/pending` | Get all pending store approval applications. | N/A |
| `POST` | `/api/admin/merchants/{id}/verify` | Approve/reject store. Upgrades user to merchant role. | `status` (VERIFIED/REJECTED), `notes` |
| `GET` | `/api/admin/products/pending` | Get all pending products waiting for review. | N/A |
| `POST` | `/api/admin/products/{id}/verify` | Approve/reject digital products. Logs action. | `status` (active/rejected), `reason` |
| `GET` | `/api/admin/ads/pending` | Get ads waiting for approval. | N/A |
| `POST` | `/api/admin/ads/{id}/verify` | Approve/reject ad. Sets expiration date automatically. | `status` (approved/rejected), `reason` |
| `POST` | `/api/admin/categories` | Add new category for products or ads. | `name`, `slug`, `type` (product/advertisement), `parent_id` |
| `PUT` | `/api/admin/categories/{id}` | Edit existing category. | Same as POST |
| `PUT` | `/api/admin/packages/{id}` | Edit package prices, duration, or benefits. | `name`, `price`, `duration_days`, `type`, `benefits` (array) |
| `GET` | `/api/admin/withdrawals/pending` | Get list of payout requests awaiting verification. | N/A |
| `POST` | `/api/admin/withdrawals/{id}/verify` | Approve/reject merchant payout. Logs action. | `status` (approved/rejected), `notes` |
| `GET` | `/api/admin/audit-logs` | Fetch admin activity moderation audit trails. | Paginated list with admin names loaded |
