import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleText } from '../../utils/helpers';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-lg font-bold">
                Sistema de Dízimos e Ofertas
              </h1>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="text-white mr-4">
                <span className="text-sm">Olá, {user?.name}</span>
                <span className="ml-2 text-xs bg-indigo-500 px-2 py-1 rounded">
                  {getRoleText(user?.role || '')}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;