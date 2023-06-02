import React, { HTMLAttributes } from 'react';
interface IconProps extends HTMLAttributes<SVGElement> {
	width?: number;
	height?: number;
}
export const CheckCircleBlueIcon = ({
	width = 20,
	height = 20,
	...restProps
}: IconProps) => {
	return (
		<svg
		width={width}
			height={height}
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...restProps}
	>
		<path
			opacity="0.1"
			d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C19.9936 4.47982 15.5202 0.00642897 10 0Z"
			fill="#0049A3"
		/>
		<path
			d="M15.7722 6.83313L10.068 14.574C9.93197 14.7545 9.72912 14.8727 9.50503 14.9022C9.28094 14.9316 9.05441 14.8698 8.87634 14.7306L4.80301 11.474C4.44356 11.1863 4.38536 10.6617 4.67301 10.3023C4.96066 9.94285 5.48523 9.88465 5.84468 10.1723L9.24134 12.8898L14.4305 5.8473C14.6007 5.59195 14.8974 5.45078 15.2029 5.47983C15.5083 5.50887 15.7731 5.70344 15.8921 5.98627C16.0111 6.26911 15.965 6.59445 15.7722 6.83313Z"
			fill="#0049A3"
		/>
	</svg>
	);
};
