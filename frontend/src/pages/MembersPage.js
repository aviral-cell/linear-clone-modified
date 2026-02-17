import React from 'react';
import { useUsers } from '../hooks/useUsers';
import Header from '../components/Header';
import MembersTable from '../components/MembersTable';

const MembersPage = () => {
  const { users, loading } = useUsers();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header fallbackText="Members" />

      <section aria-label="Members list" className="page-content">
        {loading ? (
          <div className="px-4 md:px-6 py-4">
            <div className="text-text-secondary text-sm">Loading members...</div>
          </div>
        ) : (
          <MembersTable members={users} />
        )}
      </section>
    </div>
  );
};

export default MembersPage;
