/* src/services/database.js */
import conf from '../config/conf';
import appwriteService from './appwrite'; 
import { ID, Query } from 'appwrite';

export class DatabaseService {
    
    // ... Product Methods ...

    async createProduct({name, slug, description, price, category, status, quantity, featuredImage}) {
        try {
            return await appwriteService.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionProducts,
                slug,
                { name, slug, description, price, category, status, quantity, featuredImage }
            )
        } catch (error) {
            console.log("Appwrite service :: createProduct :: error", error);
            throw error;
        }
    }

    async updateProduct(slug, {name, description, price, category, status, quantity, featuredImage}) {
        try {
            return await appwriteService.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionProducts,
                slug,
                { name, description, price, category, status, quantity, featuredImage }
            )
        } catch (error) {
            console.log("Appwrite service :: updateProduct :: error", error);
            throw error;
        }
    }

    async deleteProduct(slug) {
        try {
            await appwriteService.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionProducts,
                slug
            )
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteProduct :: error", error);
            return false;
        }
    }

    async getProduct(slug) {
        try {
            return await appwriteService.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionProducts,
                slug
            )
        } catch (error) {
            console.log("Appwrite service :: getProduct :: error", error);
            return false;
        }
    }

    async getProducts(queries = []) {
        try {
            return await appwriteService.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionProducts,
                queries,
            )
        } catch (error) {
            console.log("Appwrite service :: getProducts :: error", error);
            return false;
        }
    }

    async getOrder(id) {
        try {
            return await appwriteService.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionOrders,
                id
            )
        } catch (error) {
            console.log("Appwrite service :: getOrder :: error", error);
            return false;
        }
    }

    async updateOrderStatus(id, status) {
        try {
            return await appwriteService.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionOrders,
                id,
                { status: status }
            )
        } catch (error) {
            console.log("Appwrite service :: updateOrderStatus :: error", error);
            return false;
        }
    }

    async deleteOrder(id) {
        try {
            // ✅ FIXED: Use 'appwriteService.databases' instead of 'this.databases'
            await appwriteService.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionOrders, // ✅ FIXED: Use the ORDERS collection ID
                id
            );
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteOrder :: error", error);
            return false;
        }
    }

    // ==============================
    // 🛒 ORDERS METHODS (NEW)
    // ==============================

    async getOrders() {
        try {
            return await appwriteService.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionOrders, // ✅ Using the new variable from conf.js
                [
                    Query.orderDesc('$createdAt') // ✅ Sort: Newest first
                ]
            );
        } catch (error) {
            console.log("Appwrite service :: getOrders :: error", error);
            return false;
        }
    }

    // ==============================
    // 🖼️ STORAGE METHODS
    // ==============================

    async uploadFile(file) {
        try {
            return await appwriteService.bucket.createFile(
                conf.appwriteBucketImages,
                ID.unique(),
                file
            )
        } catch (error) {
            console.log("Appwrite service :: uploadFile :: error", error);
            return false;
        }
    }

    async deleteFile(fileId) {
        try {
            await appwriteService.bucket.deleteFile(
                conf.appwriteBucketImages,
                fileId
            )
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteFile :: error", error);
            return false;
        }
    }

    getFilePreview(fileId) {
        return appwriteService.bucket.getFilePreview(
            conf.appwriteBucketImages,
            fileId
        );
    }

    getFileView(fileId) {
        return appwriteService.bucket.getFileView(
            conf.appwriteBucketImages,
            fileId
        );
    }
}

const databaseService = new DatabaseService();
export default databaseService;