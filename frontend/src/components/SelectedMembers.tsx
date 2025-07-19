import React from 'react';

interface User {
  id: string;
  name: string;
}

interface SelectedMembersProps {
  members: User[];
  onRemove: (userId: string) => void;
  creatorId?: string;
}

const SelectedMembers: React.FC<SelectedMembersProps> = ({ members, onRemove, creatorId }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center bg-blue-100 rounded-full px-3 py-1"
        >
          <span className="mr-2">{member.name}</span>
          {member.id !== creatorId && (
            <button
              onClick={() => onRemove(member.id)}
              className="text-gray-500 hover:text-gray-700"
              aria-label={`Remove ${member.name}`}
            >
              ×
            </button>
          )}
          {member.id === creatorId && (
            <span className="text-xs text-gray-600 ml-1">(Creator)</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default SelectedMembers; 