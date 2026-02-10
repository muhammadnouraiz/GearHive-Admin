/* src/services/appwrite.js */
import { Client, Account, Databases, Storage } from 'appwrite';
import conf from '../config/conf';

export class AppwriteService {
    client = new Client();
    account;
    databases;
    bucket;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }
}

const appwriteService = new AppwriteService();
export default appwriteService;