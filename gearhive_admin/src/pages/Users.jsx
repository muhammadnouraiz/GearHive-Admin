/* src/pages/Users.jsx */
import React from 'react';

function Users() {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registered Customers</h2>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    To protect user privacy, the Client SDK cannot list all registered users directly. 
                    <br /><br />
                    <strong>Future Implementation:</strong> You will need to create a `profiles` collection in your database that saves user details whenever someone registers in the Store app. This page will then fetch from that collection.
                </p>
                <button className="mt-6 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed">
                    Sync Users (Coming Soon)
                </button>
            </div>
        </div>
    );
}

export default Users;