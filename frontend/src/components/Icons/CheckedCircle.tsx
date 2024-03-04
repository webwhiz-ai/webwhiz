import React, { HTMLAttributes } from 'react';
interface IconProps extends HTMLAttributes<SVGElement> {
  width?: number;
  height?: number;
}
export const CheckedCircleIcon = ({
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
        stroke="#38A169"
      />
      <path
        d="M9.2485 13.4965C9.0245 13.4965 8.8005 13.4115 8.6295 13.2405L6.2565 10.8675C5.9145 10.5255 5.9145 9.9715 6.2565 9.6305C6.5985 9.2885 7.1515 9.2875 7.4935 9.6295L9.2485 11.3845L13.3765 7.2565C13.7185 6.9145 14.2715 6.9145 14.6135 7.2565C14.9555 7.5985 14.9555 8.1525 14.6135 8.4945L9.8675 13.2405C9.6965 13.4115 9.4725 13.4965 9.2485 13.4965Z"
        fill="#38A169"
      />
    </svg>
  );
};
