
import React from 'react';

type IconName = 'bone' | 'search' | 'trophy' | 'home' | 'loader' | 'alert' | 'info' | 'chevron-left' | 'chevron-right' | 'heart' | 'stethoscope';

interface IconProps {
  name: IconName;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = "w-6 h-6" }) => {
  const paths: Record<IconName, React.ReactNode> = {
    bone: <path d="M17 10c.7-.7 1.69 0 2.5 0 2.5 0 4.5 2 4.5 4.5S22 19 19.5 19c-.81 0-1.8 1.03-2.5 0M7 10c-.7-.7-1.69 0-2.5 0C2 10 0 12 0 14.5S2 19 4.5 19c.81 0 1.8 1.03 2.5 0M17 10c-.7-.7-1.69-1.03-2.5-1.03C12 8.97 10 10.97 10 13.47S12 18 14.5 18c.81 0 1.8-.7 2.5 0M7 10c.7-.7 1.69-1.03 2.5-1.03 2.5 0 4.5 2 4.5 4.5S12 18 9.5 18c-.81 0-1.8-.7-2.5 0" />,
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    trophy: (
      <>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34" />
        <path d="M14 14.66V17c0 .55 1 1 1 1h2c.55 0 1-.45 1-1v-2.34" />
        <path d="M12 2v12.66" />
      </>
    ),
    home: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    loader: <path d="M21 12a9 9 0 1 1-6.219-8.56" />,
    alert: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </>
    ),
    'chevron-left': <polyline points="15 18 9 12 15 6" />,
    'chevron-right': <polyline points="9 18 15 12 9 6" />,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    stethoscope: (
      <>
        <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z" />
        <path d="M3.3 7a4.95 4.95 0 0 0 4.5 4 4.95 4.95 0 0 0 4.5-4" />
        <path d="M15 8a2 2 0 1 0-2-2" />
        <path d="M17 6.2c.3.3.6.5 1 .7a4.1 4.1 0 0 1 2.3 3.8 4.1 4.1 0 0 1-4.1 4.1 4.1 4.1 0 0 1-4.1-4.1" />
        <path d="M9 14v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-6" />
        <circle cx="12" cy="14" r="3" />
      </>
    )
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
      {paths[name]}
    </svg>
  );
};

export default Icon;
