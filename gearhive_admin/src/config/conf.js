/* src/config/conf.js */

const conf = {
    appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteCollectionProducts: String(import.meta.env.VITE_APPWRITE_COLLECTION_PRODUCTS),
    appwriteCollectionOrders: String(import.meta.env.VITE_APPWRITE_COLLECTION_ORDERS),
    appwriteBucketImages: String(import.meta.env.VITE_APPWRITE_BUCKET_IMAGES),
}

export default conf;