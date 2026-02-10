
import React from 'react';

type IconName = 'bone' | 'search' | 'trophy' | 'home' | 'loader' | 'alert' | 'info' | 'chevron-left' | 'chevron-right' | 'heart' | 'stethoscope';

interface IconProps {
  name: IconName;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = "w-6 h-6" }) => {
  // Mapeo de nombres a Emojis para una identificación instantánea por niños
  const emojis: Partial<Record<IconName, string>> = {
    bone: '🦴',
    search: '🔍',
    heart: '💖',
    stethoscope: '🩺',
    trophy: '🏆',
    home: '🏠',
    alert: '⚠️',
    info: '💡',
    'chevron-left': '⬅️',
    'chevron-right': '➡️',
  };

  // Si el icono es un emoji, lo renderizamos como texto
  if (emojis[name]) {
    return (
      <span className={`inline-flex items-center justify-center leading-none ${className}`} style={{ fontSize: '1.25em' }}>
        {emojis[name]}
      </span>
    );
  }

  // Para iconos funcionales como el loader, mantenemos el SVG animado
  const svgPaths: Partial<Record<IconName, React.ReactNode>> = {
    loader: <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeWidth="3" />,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {svgPaths[name]}
    </svg>
  );
};

export default Icon;
