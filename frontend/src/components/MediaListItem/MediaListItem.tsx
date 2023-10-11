import * as React from 'react';
import {
	Box,
	BoxProps,
	Button,
	Flex,
	Heading,
	HStack,
	IconButton,
	Image,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
} from '@chakra-ui/react';
import { FiMoreHorizontal } from "react-icons/fi"
import styles from './MediaListItem.module.scss';

import { useEffect } from 'react';
import { DefaultMediaImage } from '../DefaultMediaImage/DefaultMediaImage';

interface MediaListItemProps extends BoxProps {
	imageUrl: string;
	name: string;
	imageAlt: string;
	description: string;
	showWarning: boolean;
	showCustomizeMenu: boolean;
	showGetCodeMenu: boolean;
	isPrimaryButtonLoading?: boolean;
	actionButtonLabel?: string;
	showPrimaryActionButton?: boolean;
	onPrimaryActionButtonClick?: () => void;
	onMenuItemClick?: (type: any) => void;
	actionButtonLeftIcon?: React.ReactNode;
	onActionButtonClick?: () => void;
}

export const MediaListItem = ({ onMenuItemClick, showWarning, showPrimaryActionButton, isPrimaryButtonLoading, onPrimaryActionButtonClick, className, ...restProps }: MediaListItemProps) => {
	useEffect(() => {
		async function fetchData() {
			try {
			} catch (error) {
				console.log('Unable to fetch note', error);
			} finally {
			}
		}
		fetchData();
	}, []);
	const onSelect = React.useCallback((type) => {
		onMenuItemClick && onMenuItemClick(type)
	}, [onMenuItemClick])
	return (
		<HStack
			shadow='xs'
			p='4'
			bg={showWarning ? 'orange.50': 'white'}
			borderRadius='lg'
			className={className || '' + ' ' + styles.container}
			spacing='4'
			align='start'
			w={restProps.width || '100%'}
			flexShrink={0}
			justify='space-between'
			alignItems='start'
		>
			<HStack spacing={4}>
				<Flex
					alignItems='center'
					justifyContent='center'
					shadow='base'
					boxSize='96px'
					shrink={0}
					borderRadius='lg'
				>
					{restProps.imageUrl ? (
						<Image
							borderRadius='lg'
							objectFit="cover"
							src={restProps.imageUrl}
							alt={restProps.imageAlt}
						/>
					) : (
						<DefaultMediaImage />
					)}
				</Flex>
				<Flex alignSelf='start' direction='column'>
					<Heading cursor="pointer" mb='8px' fontSize='lg' onClick={()=>{
						onSelect('edit')
					}}>
						{restProps.name}
					</Heading>
					{restProps.description && <Text noOfLines={2} fontSize='sm' color='gray.500' dangerouslySetInnerHTML={{ __html: restProps.description }} >
					</Text>}

					{
						showPrimaryActionButton && (<Box mt="4">
							<Button onClick={onPrimaryActionButtonClick} isLoading={isPrimaryButtonLoading}
								loadingText='Creating chat bot' colorScheme="blue" size='xs'>
								Create chatbot
							</Button>
						</Box>)
					}

				</Flex>
			</HStack>
			<HStack>
				<Box alignSelf='end'>
					{restProps.actionButtonLabel ? (
						<Button
							{...{
								[restProps.actionButtonLeftIcon ? 'leftIcon' : '']:
									restProps.actionButtonLeftIcon,
							}}
							onClick={restProps.onActionButtonClick}
							size='sm'
							variant='outline'
						>
							{restProps.actionButtonLabel}
						</Button>
					) : <Menu placement="bottom-end">
						<MenuButton
							as={IconButton}
							minW='8'
							minH='8'
							h="8"
							aria-label='Options'
							icon={<FiMoreHorizontal />}
							color="gray.500"
							variant='outline'
						/>
						<MenuList minW="140px">
							<MenuItem fontSize="14" textAlign="right" fontWeight="medium" color="gray.600" onClick={() => {
								console.log('edit')
								onSelect('edit')
							}}>
								Edit
							</MenuItem>
							{restProps.showCustomizeMenu ? <MenuItem fontSize="14" textAlign="right" fontWeight="medium" color="gray.600" onClick={() => {
								onSelect('customize')
							}}>
								Customize
							</MenuItem> : null}
							{restProps.showGetCodeMenu ? <MenuItem fontSize="14" textAlign="right" fontWeight="medium" color="gray.600" onClick={() => {
								onSelect('getCode')
							}}>
								Get code
							</MenuItem> : null}
							<MenuItem fontSize="14" textAlign="right" fontWeight="medium" color="gray.600" onClick={() => {
								onSelect('delete')
							}}>
								Delete
							</MenuItem>
						</MenuList>
					</Menu>}

				</Box>
			</HStack>
		</HStack>
	);
};
