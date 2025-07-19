import React, { useState } from 'react';
import CreateGroup from '../components/CreateGroup';

const Groups: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateSuccess = (groupName: string, memberCount: number) => {
    setSuccessMessage(`Group '${groupName}' created with ${memberCount} members`);
    setShowCreateForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Groups</h1>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Group
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {showCreateForm ? (
        <div className="bg-white shadow-md rounded-lg">
          <div className="border-b px-4 py-3 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create New Group</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <CreateGroup
            currentUserId="current-user-id" // This should come from your auth context
            onSuccess={handleCreateSuccess}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Groups; 