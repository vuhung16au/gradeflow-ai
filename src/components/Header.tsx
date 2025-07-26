import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              GradeFlow AI
            </h1>
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              AI-Powered Marking
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Streamline your grading process
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 