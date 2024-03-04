import React, { HTMLAttributes } from 'react';
interface IconProps extends HTMLAttributes<SVGElement> {
  width?: number;
  height?: number;
}
export const DefaultMediaImage = ({
  width = 56,
  height = 56,
  ...restProps
}: IconProps) => {
  return (
    <svg
      width={width}
      height={height}
      {...restProps}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.7775 56L0.14624 45.806V9.66895L23.7775 19.5058V56Z"
        fill="#E6A352"
      />
      <path
        d="M23.7739 56L55.2844 45.806V9.66895L23.7739 19.5058V56Z"
        fill="#D59240"
      />
      <path
        d="M0 9.68236L14.72 5.18457L38.6912 15.1001L23.7156 19.5468L0 9.68236Z"
        fill="#E8B06D"
      />
      <path
        d="M14.6241 5.18779L31.4397 0L55.3087 9.66002L38.6464 15.1545L14.6241 5.18779Z"
        fill="#E8B06D"
      />
    </svg>
  );
};
