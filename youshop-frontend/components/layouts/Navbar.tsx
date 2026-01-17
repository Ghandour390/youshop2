'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { categories as categoriesApi } from '@/lib/api/categories';
import { notificationsApi } from '@/lib/api/notifications';
import NotificationIcon from '@/components/NotificationIcon';
import Badge from '../Badge';
import { useAuth } from '@/lib/context/AuthContext';

interface Category {
  id: number;
  name: string;
}

interface ApiResponse {
  success: boolean;
  data: Category[];
  timestamp: string;
}

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await notificationsApi.getAll();
          const unreadCount = response.data?.filter((n: any) => !n.read).length || 0;
          setNotificationCount(unreadCount);
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchNotificationCount();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  if (!mounted || isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 text-white shadow-lg z-50">
        <div className="w-full px-4">
          <div className="flex items-center h-16">
            <Link href="/" className="text-2xl font-bold">
              YouShop
            </Link>
            <button className="md:hidden ml-auto" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    );
  }


  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 text-white shadow-lg overflow-hidden z-50">
      <div className="w-full px-4">
        <div className="flex items-center h-16">
          <Link href="/" className="text-2xl font-bold">
            YouShop
          </Link>
          
          <div className="hidden md:block overflow-hidden flex-1 mx-4">
            <ul className="flex gap-6 animate-scroll whitespace-nowrap">
              {[...categories, ...categories]?.map((category, index) => (
                <li key={`${category.id}-${index}`}>
                  <Link 
                    href={`/categories/${category.id}`}
                    className="hover:text-gray-300 transition"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Badge />
                <NotificationIcon 
                  count={notificationCount} 
                  onCountChange={setNotificationCount}
                />
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded transition"
                  >
                    {user?.photo ? (
                      <img src={user.photo} alt="Profile" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-600">
                        <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-600 transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Mon profil
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm hover:bg-gray-600 transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Mes commandes
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm hover:bg-gray-600 transition"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Administration
                        </Link>
                      )}
                      <hr className="my-1 border-gray-600" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 transition"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 hover:bg-gray-700 rounded transition">
                  Login
                </Link>
                <Link href="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition">
                  Register
                </Link>
              </>
            )}
          </div>

          <button 
            className="md:hidden ml-auto"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4">
            <ul className="flex flex-col gap-2">
              {categories?.map(category => (
                <li key={category.id}>
                  <Link 
                    href={`/categories/${category.id}`}
                    className="block py-2 px-2 hover:bg-gray-700 rounded transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
            
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </nav>
  );
}
