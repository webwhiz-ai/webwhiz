import React, { HTMLAttributes } from 'react';
interface IconProps extends HTMLAttributes<SVGElement> {
  width?: number;
  height?: number;
}
export const CheckCircleIcon = ({
  width = 20,
  height = 20,
  ...restProps
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      {...restProps}
    >
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="9.5"
        fill="white"
        fillOpacity="0.92"
        stroke="#A0AEC0"
      />
    </svg>
  );
};
