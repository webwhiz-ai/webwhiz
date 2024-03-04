import React, { HTMLAttributes } from 'react';
interface IconProps extends HTMLAttributes<SVGElement> {
  width?: number;
  height?: number;
}
export const StripeColorIcon = ({
  width = 32,
  height = 32,
  ...restProps
}: IconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
    >
      <path
        d="M2.87195 6.36807C2 8.07937 2 10.3196 2 14.8V17.2C2 21.6804 2 23.9206 2.87195 25.6319C3.63893 27.1372 4.86278 28.3611 6.36807 29.128C8.07937 30 10.3196 30 14.8 30H17.2C21.6804 30 23.9206 30 25.6319 29.128C27.1372 28.3611 28.3611 27.1372 29.128 25.6319C30 23.9206 30 21.6804 30 17.2V14.8C30 10.3196 30 8.07937 29.128 6.36807C28.3611 4.86278 27.1372 3.63893 25.6319 2.87195C23.9206 2 21.6804 2 17.2 2H14.8C10.3196 2 8.07937 2 6.36807 2.87195C4.86278 3.63893 3.63893 4.86278 2.87195 6.36807Z"
        fill="url(#paint0_linear_2813_15242)"
      />
      <path
        d="M2.26522 8.28002C2 9.78729 2 11.7873 2 14.8004V17.2004C2 21.6809 2 23.9211 2.87195 25.6324C3.63893 27.1377 4.86278 28.3615 6.36807 29.1285C8.07937 30.0004 10.3196 30.0004 14.8 30.0004H17.2C21.6804 30.0004 23.9206 30.0004 25.6319 29.1285C27.1372 28.3615 28.3611 27.1377 29.128 25.6324C30 23.9211 30 21.6809 30 17.2004V14.8004C30 10.32 30 8.07981 29.128 6.36852C28.3877 4.9156 27.2218 3.72488 25.788 2.9541L2.26522 8.28002Z"
        fill="url(#paint1_linear_2813_15242)"
      />
      <path
        d="M29.7103 23.8535C29.5817 24.5293 29.3961 25.1053 29.1281 25.6314C28.3611 27.1367 27.1372 28.3605 25.6319 29.1275C23.9719 29.9734 21.814 29.9987 17.5963 29.9994H16.0586V26.8362L29.7103 23.8535Z"
        fill="url(#paint2_linear_2813_15242)"
      />
      <path
        d="M17.2 2H14.8C13.9283 2 13.1414 2 12.4268 2.00642V5.97052L25.7854 2.95225C25.7345 2.92495 25.6834 2.89818 25.6319 2.87195C24.6819 2.38788 23.5688 2.17255 22 2.07676C20.7429 2 19.1931 2 17.2 2Z"
        fill="url(#paint3_linear_2813_15242)"
      />
      <path
        d="M29.9996 17.3736C29.9995 20.3792 29.9941 22.3603 29.7099 23.8543L24.9619 24.8916V17.8161L29.9996 16.6445V17.3736Z"
        fill="url(#paint4_linear_2813_15242)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.9414 13.3779C14.9414 12.7352 15.4668 12.488 16.3371 12.488C17.585 12.488 19.1614 12.867 20.4093 13.5427V9.67014C19.0464 9.12633 17.7 8.91211 16.3371 8.91211C13.0038 8.91211 10.7871 10.6589 10.7871 13.5756C10.7871 18.1238 17.0268 17.3987 17.0268 19.3597C17.0268 20.1178 16.3699 20.365 15.4504 20.365C14.0876 20.365 12.347 19.8047 10.9677 19.0466V22.9686C12.4948 23.6278 14.0383 23.9079 15.4504 23.9079C18.8658 23.9079 21.2139 22.2106 21.2139 19.2609C21.1975 14.3501 14.9414 15.2235 14.9414 13.3779Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2813_15242"
          x1="2"
          y1="2"
          x2="11.1966"
          y2="8.50209"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#392993" />
          <stop offset="1" stopColor="#4B47B9" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2813_15242"
          x1="3.05439"
          y1="8.57491"
          x2="23.3566"
          y2="25.3214"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#594BB9" />
          <stop offset="1" stopColor="#60A8F2" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2813_15242"
          x1="16.0586"
          y1="26.9535"
          x2="30"
          y2="29.9995"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#61A2EF" />
          <stop offset="1" stopColor="#58E6FD" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_2813_15242"
          x1="12.4268"
          y1="3.99163"
          x2="30"
          y2="2"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#534EBE" />
          <stop offset="1" stopColor="#6875E2" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_2813_15242"
          x1="24.9619"
          y1="17.8747"
          x2="29.9996"
          y2="23.9081"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#71A5F3" />
          <stop offset="1" stopColor="#6CC3FA" />
        </linearGradient>
      </defs>
    </svg>
  );
};
