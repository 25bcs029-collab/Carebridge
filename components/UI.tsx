
import React, { useId } from 'react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

export const Logo: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'inline', 
  className?: string,
  featureIcon?: string 
}> = ({ size = 'md', className = '', featureIcon }) => {
  const sizes = {
    inline: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const isSmall = size === 'inline' || size === 'sm';

  return (
    <div className={`${sizes[size]} rounded-[28%] bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#10b981] ${isSmall ? 'p-[15%]' : 'p-[12%]'} shadow-xl border-white ${isSmall ? 'border-2' : 'border-4'} flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}>
      {featureIcon ? (
        <i className={`fas ${featureIcon} ${isSmall ? 'text-[10px]' : 'text-3xl'} text-white`}></i>
      ) : (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          {/* Refined Medical Plus Sign - Bold and Professional */}
          <rect x="40" y="20" width="20" height="60" rx="6" fill="white" />
          <rect x="20" y="40" width="60" height="20" rx="6" fill="white" />
          
          {/* Subtle depth effect on the plus */}
          <rect x="40" y="40" width="20" height="20" rx="2" fill="black" fillOpacity="0.05" />
        </svg>
      )}
    </div>
  );
};

export const Button: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
}> = ({ onClick, children, variant = 'primary', className = '', type = 'button', disabled, ariaLabel }) => {
  const base = "px-4 py-2 rounded-lg font-black transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 uppercase tracking-tight";
  const variants = {
    primary: "bg-[#2563eb] text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 outline-none shadow-md",
    secondary: "bg-[#f1f5f9] text-[#334155] hover:bg-slate-200 focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 outline-none",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 outline-none shadow-md",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 outline-none"
  };
  
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${base} ${variants[variant]} ${className}`} 
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<{
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
  ariaLabel?: string;
  onlyNumbers?: boolean;
  maxLength?: number;
}> = ({ label, value, onChange, placeholder, type = 'text', required, className = '', ariaLabel, onlyNumbers, maxLength }) => {
  const id = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (onlyNumbers) {
      val = val.replace(/[^0-9]/g, '');
    }
    if (maxLength && val.length > maxLength) {
      val = val.substring(0, maxLength);
    }
    onChange(val);
  };

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-sm font-black text-slate-600 uppercase tracking-tighter">
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        aria-label={ariaLabel || label}
        inputMode={onlyNumbers ? 'numeric' : type === 'tel' ? 'tel' : 'text'}
        className={`bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-400 shadow-sm transition-all ${className}`}
      />
    </div>
  );
};

export const Header: React.FC<{ 
  title: string; 
  showBack?: boolean; 
  backRoute?: string; 
  icon?: string;
  rightAction?: React.ReactNode;
}> = ({ title, showBack, backRoute, icon, rightAction }) => {
  const navigate = useNavigate();
  
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (backRoute) {
      navigate(backRoute);
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/dashboard');
      }
    }
  };
  
  return (
    <nav className="flex items-center justify-between p-5 bg-white border-b sticky top-0 z-50" aria-label="Main Navigation">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            type="button"
            onClick={handleBack} 
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:ring-2 focus:ring-slate-300 outline-none z-50 relative cursor-pointer"
            aria-label="Go Back"
          >
            <i className="fas fa-chevron-left text-lg pointer-events-none"></i>
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <Logo size="inline" featureIcon={icon} />
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightAction}
      </div>
    </nav>
  );
};
