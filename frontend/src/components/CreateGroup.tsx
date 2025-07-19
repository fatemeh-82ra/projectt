import React, { useState, useEffect } from 'react';
import { mockApi } from '../api/mockApi';
import MemberSearch from './MemberSearch';
import SelectedMembers from './SelectedMembers';

interface User {
  id: string;
  name: string;
}

interface CreateGroupProps {
  currentUserId: string;
  onSuccess: (groupName: string, memberCount: number) => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ currentUserId, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Add current user as creator
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await mockApi.getUser(currentUserId);
        setSelectedMembers([user]);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    getCurrentUser();
  }, [currentUserId]);

  const handleAddMember = (user: User) => {
    if (!selectedMembers.some(member => member.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (userId !== currentUserId) {
      setSelectedMembers(selectedMembers.filter(member => member.id !== userId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await mockApi.createGroup({
        name,
        description,
        members: selectedMembers.map(member => member.id)
      });

      onSuccess(name, selectedMembers.length);
      // Reset form
      setName('');
      setDescription('');
      setSelectedMembers([]);
    } catch (error) {
      setError('Failed to create group. Please try again.');
      console.error('Error creating group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Group Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Add Members
        </label>
        <MemberSearch
          onSelect={handleAddMember}
          selectedMembers={selectedMembers}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Selected Members ({selectedMembers.length})
        </label>
        <SelectedMembers
          members={selectedMembers}
          onRemove={handleRemoveMember}
          creatorId={currentUserId}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !name.trim() || selectedMembers.length === 0}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Creating...' : 'Create Group'}
      </button>
    </form>
  );
};

export default CreateGroup; 