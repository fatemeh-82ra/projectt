import React, { useState, useEffect } from 'react';
import { mockApi } from '../api/mockApi';

interface User {
  id: string;
  name: string;
}

interface MemberSearchProps {
  onSelect: (user: User) => void;
  selectedMembers: User[];
}

const MemberSearch: React.FC<MemberSearchProps> = ({ onSelect, selectedMembers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await mockApi.searchUsers(searchTerm);
        // Filter out already selected members
        const filteredResults = results.filter(
          (user: User) => !selectedMembers.some((member: User) => member.id === user.id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedMembers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search members..."
          className="w-full p-2 border rounded-md"
        />
        {isLoading && (
          <div className="absolute right-2 top-2">
            <span className="loading">Loading...</span>
          </div>
        )}
      </div>
      
      {searchResults.length > 0 ? (
        <ul className="mt-2 border rounded-md max-h-60 overflow-y-auto">
          {searchResults.map((user: User) => (
            <li
              key={user.id}
              onClick={() => onSelect(user)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {user.name}
            </li>
          ))}
        </ul>
      ) : searchTerm && !isLoading ? (
        <div className="mt-2 text-gray-500">No results found</div>
      ) : null}
    </div>
  );
};

export default MemberSearch; 