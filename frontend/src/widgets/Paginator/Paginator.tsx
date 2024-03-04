import * as React from "react";
import ReactPaginate from "react-paginate";
import styles from "./Paginator.module.scss";

interface PaginatorProps {
	onPageChange: (page: number) => void;
	pageRangeDisplayed: number;
	pageCount: number;
}


export const Paginator = ({
	onPageChange,
	pageRangeDisplayed,
	pageCount
}: PaginatorProps) => {

	const handlePageChange = React.useCallback((selectedItem: { selected: number }) => {
		onPageChange(selectedItem.selected);
	}, [onPageChange]);

	return (

		<ReactPaginate
			className={styles.pagination}
			breakLabel="..."
			nextLabel="Next"
			containerClassName={styles.container}
			previousClassName={styles.previous}
			nextClassName={styles.next}
			pageClassName={styles.page}
			activeClassName={styles.active}
			breakClassName={styles.break}
			onPageChange={handlePageChange}
			pageRangeDisplayed={pageRangeDisplayed}
			pageCount={pageCount}
			previousLabel="Previous"
			renderOnZeroPageCount={null}
		/>
	);
};
