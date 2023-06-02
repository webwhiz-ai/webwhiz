import * as React from "react";
import ReactPaginate from "react-paginate";

import styles from "./Paginator.module.scss";

interface PaginatorProps {
	onPageChange: (event: any) => void;
	pageRangeDisplayed: number;
	pageCount: number;
}


export const Paginator = ({
	onPageChange,
	pageRangeDisplayed,
	pageCount
}: PaginatorProps) => {
	return (

		<ReactPaginate
			className={styles.pagination}
			breakLabel="..."
			nextLabel="next"
			containerClassName={styles.container}
			previousClassName={styles.previous}
			nextClassName={styles.next}
			pageClassName={styles.page}
			activeClassName={styles.active}
			breakClassName={styles.break}
			onPageChange={onPageChange}
			pageRangeDisplayed={pageRangeDisplayed}
			pageCount={pageCount}
			previousLabel="previous"
			renderOnZeroPageCount={null}
		/>
	);
};
