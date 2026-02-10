🐝 GearHive E-Commerce Platform
GearHive is a modern, full-stack e-commerce application designed to simulate a real-world online tech store. It features a dual-interface architecture providing a seamless shopping experience for customers and a robust management dashboard for administrators.

Built with React.js and powered by Appwrite as the Backend-as-a-Service (BaaS).

🚀 Key Features
🛒 Customer Storefront (User Facing)
Product Catalog: Browse tech gear across categories like Phones, Laptops, Audio, Wearables, and Cameras.

Dynamic Cart System: Real-time addition/removal of items with instant subtotal calculation.

State Management: Cart persistence using Redux Toolkit.

Checkout Process: Custom form capturing shipping details with simulated payment logic.

Smart Inventory: Automatically decrements product stock upon successful order placement.

💼 Admin Dashboard (Business Logic)
Real-time Analytics: Dashboard overview showing Total Sales, Total Orders, and Inventory Counts.

Inventory Management: Full CRUD capabilities for products (Add, Edit, Delete) with image uploading via Appwrite Storage.

Order Management: View customer orders with filtering (Processing, Shipped, Delivered, Cancelled) and sorting.

Order Details: Deep dive into specific orders to view shipping info and update status.

Secure Access: Protected Admin routes with Login/Logout functionality.

🛠️ Tech Stack
Frontend: React.js (Vite)

Backend: Appwrite (Database, Auth, Storage)

State Management: Redux Toolkit

Styling: Tailwind CSS

Routing: React Router DOM

Icons: Lucide React

💾 Database Schema
The application relies on two primary Appwrite Collections.

1. Products Collection
name (String): The display name of the product.

slug (String): A URL-friendly unique ID.

description (String): Detailed product information.

price (Float): Cost per unit.

quantity (Integer): Current stock level.

category (String): Product category (e.g., "phones", "laptops").

status (Boolean): Determines if the product is visible in the store.

featuredImage (String): Appwrite Storage File ID for the product image.

2. Orders Collection
customer_name (String): Full name of the buyer.

address (String): Complete shipping address.

total_amount (Float): The final calculated value of the cart.

items_count (Integer): The total quantity of individual items purchased.

status (String): The current state of the order (Processing, Shipped, Delivered, Cancelled).

payment_status (String): Payment confirmation status (Paid, Unpaid).

⚙️ Installation & Setup
1. Clone the Repository:
git clone https://github.com/your-username/gearhive.git
cd gearhive

2. Install Dependencies:
npm install

3. Configure Appwrite
Create a file named .env in the root directory and add your Appwrite credentials:
VITE_APPWRITE_URL=""
VITE_APPWRITE_PROJECT_ID=""
VITE_APPWRITE_DATABASE_ID=""
VITE_APPWRITE_COLLECTION_PRODUCTS=""
VITE_APPWRITE_COLLECTION_ORDERS=""
VITE_APPWRITE_BUCKET_IMAGES=""

4. Run the Development Server:
npm run dev

📸 Screenshots
Admin Dashboard Overview of sales, inventory, and recent orders.

Order Management Filterable list of all customer orders.

Add Product Interface for uploading new inventory.


🔮 Future Improvements
Stripe Integration: The checkout architecture is decoupled and ready for a drop-in Stripe Payment Link integration.

User Reviews: Allow customers to rate purchased products.

Dark Mode: System-wide dark theme support.