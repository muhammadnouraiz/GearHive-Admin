/* src/services/auth.js */
import appwriteService from './appwrite';

// 🔒 SECURITY: Only this email is allowed to access the Admin Panel
// Replace this with your actual admin email
const ALLOWED_ADMIN_EMAIL = "gearhiveofficial@gmail.com"; 

export class AuthService {
    
    // We REMOVED createAccount() because no one should register via the Admin Panel.
    // You must create your account manually in the Appwrite Console.

    async login({ email, password }) {
        try {
            // 1. Gatekeeper Check: Is this the authorized admin email?
            if (email !== ALLOWED_ADMIN_EMAIL) {
                throw new Error("Unauthorized access. This email is not an admin.");
            }

            // 2. If email matches, attempt Appwrite Login
            return await appwriteService.account.createEmailPasswordSession(email, password);
        } catch (error) {
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            // Get the user from Appwrite
            const user = await appwriteService.account.get();
            
            // Double Check: Even if a session exists, is it the right user?
            if (user && user.email === ALLOWED_ADMIN_EMAIL) {
                return user;
            } else {
                // If a non-admin somehow has a session, kill it immediately
                await this.logout(); 
                return null;
            }
        } catch (error) {
            console.log("Appwrite service :: getCurrentUser :: error", error);
        }
        return null;
    }

    async logout() {
        try {
            await appwriteService.account.deleteSessions();
        } catch (error) {
            console.log("Appwrite service :: logout :: error", error);
        }
    }
}

const authService = new AuthService();
export default authService;