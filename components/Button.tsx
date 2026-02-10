
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'yellow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-black transition-all active:translate-y-1 active:shadow-none rounded-[2rem] border-b-[8px]";
  
  const variants = {
    primary: "bg-sky-400 text-white border-sky-600 hover:bg-sky-500",
    secondary: "bg-white text-sky-600 border-slate-200 hover:bg-slate-50",
    danger: "bg-rose-400 text-white border-rose-600 hover:bg-rose-500",
    success: "bg-emerald-400 text-white border-emerald-600 hover:bg-emerald-500",
    yellow: "bg-yellow-400 text-white border-yellow-600 hover:bg-yellow-500",
  };

  const sizes = {
    sm: "px-6 py-2 text-lg",
    md: "px-8 py-4 text-xl",
    lg: "px-10 py-5 text-2xl",
    xl: "px-14 py-7 text-3xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
