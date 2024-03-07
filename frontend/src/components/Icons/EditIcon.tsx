import React, { HTMLAttributes } from 'react';

interface IconProps extends HTMLAttributes<SVGElement> {
  width?: number;
  height?: number;
}
export const EditIcon = ({
  width = 18,
  height = 18,
  ...restProps
}: IconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      focusable="false"
      {...restProps}
    >
      <g
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="2"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </g>
    </svg>
  );
};
