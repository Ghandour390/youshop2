'use client';

import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

export default function Sidebar({ isOpen, onClose, onSearch }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      )}
      
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recherche</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                🔍
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Catégories</h3>
              <ul className="space-y-2">
                <li><button className="text-gray-600 hover:text-blue-600">Électronique</button></li>
                <li><button className="text-gray-600 hover:text-blue-600">Vêtements</button></li>
                <li><button className="text-gray-600 hover:text-blue-600">Maison</button></li>
                <li><button className="text-gray-600 hover:text-blue-600">Sports</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
