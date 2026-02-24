import React from 'react';

const Button = ({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  size = "md",
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 whitespace-nowrap hover:scale-[1.02]';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:shadow-purple-500/30',
    secondary:
      'bg-gray-800 text-gray-300 hover:bg-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    outline:
      'bg-transparent border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 dark:border-gray-400 dark:text-gray-200 dark:hover:bg-gray-700',
    danger:
      'bg-red-500 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-pink-600 hover:shadow-xl hover:shadow-red-500/30',
  };

  const sizeStyle = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        baseStyles,
        variantStyles[variant] || variantStyles.primary,
        sizeStyle[size],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
};

export default Button;
