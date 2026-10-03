# Security Specification

## 1. Data Invariants
1. `products`: Anyone can read products (`get`, `list`). Only authenticated administrators can create, update, or delete products.
2. `orders`: Any customer can create a purchase order with valid fields (`id`, `customerName`, `phone`, `address`, `total`, `status: 'pending'`, `paymentMethod: 'cod'`). Customers cannot overwrite existing orders or tamper with past orders. Only administrators can read or update order statuses (e.g. `processing`, `shipped`, `delivered`, `cancelled`).
3. `admins`: Administrators are explicitly registered in `/admins/{uid}`. Write access is restricted to verified administrators (`gmripon703@gmail.com` bootstrapped).
4. `settings`: Publicly readable store configuration; write-restricted to administrators.
5. All IDs must conform to `^[a-zA-Z0-9_\\-]+$` with length <= 128 characters.
6. Order status transitions must be one of `['pending', 'processing', 'shipped', 'delivered', 'cancelled']`. Terminal states like `cancelled` or `delivered` cannot be modified by non-admins.

## 2. The "Dirty Dozen" Payloads (Must be Denied)
1. **Unauthenticated Product Injection**: An unauthenticated user tries to `create` a new product document at `/products/hacked-item`.
2. **Ghost Field Poisoning**: An admin tries to update a product with an unlisted field `"maliciousScript": "<script>alert(1)</script>"`.
3. **Price Tampering in Order**: An attacker creates an order with a negative total `total: -500`.
4. **Order Status Escalation**: An attacker creates an order with `status: 'delivered'` instead of `'pending'`.
5. **Customer Reading All Orders**: An unauthenticated user tries to `list` documents at `/orders`.
6. **Customer Reading Another Customer's Order**: An unauthenticated user tries to `get` `/orders/order-12345`.
7. **Customer Tampering Existing Order**: An attacker attempts an `update` on `/orders/order-12345` to modify the shipping address after submission.
8. **Admin Self-Escalation**: A non-admin authenticated user attempts to write a document at `/admins/$(request.auth.uid)`.
9. **Junk ID Resource Exhaustion**: An attacker tries to create an order with a 2,000-character document ID.
10. **Store Settings Overwrite**: A regular authenticated visitor attempts to update `/settings/global` to change the support phone number.
11. **Spoofed Admin Email**: A user with unverified email `gmripon703@gmail.com` (`email_verified: false`) attempts an admin write.
12. **Unbounded Payload Injection**: An attacker submits a customer name with a 50,000-character string into `/orders`.

## 3. Test Runner
Refer to `firestore.rules.test.ts` for automated assertions.
