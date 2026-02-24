import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * PageHeader Component
 * Displays the page title with optional subtitle and children
 */
const PageHeader = ({ title, subtitle, children }) => {
  const { colors } = useTheme();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className={`text-3xl font-bold ${colors.text} tracking-tight mb-2 bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`text-sm ${colors.textSecondary}`}>
            {subtitle}
          </p>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
};

export default PageHeader;
