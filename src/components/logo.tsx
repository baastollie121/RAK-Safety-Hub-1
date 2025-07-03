import React from 'react';

export function Logo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <g>
        <path
          d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
        />
        <text
          x="50"
          y="62"
          fontFamily="Space Grotesk, sans-serif"
          fontSize="40"
          fontWeight="bold"
          fill="currentColor"
          textAnchor="middle"
        >
          R
        </text>
      </g>
    </svg>
  );
}
