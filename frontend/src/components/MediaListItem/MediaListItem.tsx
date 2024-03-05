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
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	Badge
} from '@chakra-ui/react';
import { FiMoreHorizontal } from "react-icons/fi"
import styles from './MediaListItem.module.scss';

import { useEffect, useState, useRef } from 'react';
import { DefaultMediaImage } from '../DefaultMediaImage/DefaultMediaImage';
import { PermissionsType, CurrentUser, User } from '../../services/appConfig';
import { InviteUserParams, getUserProfile } from '../../services/userServices';

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
	participants?: InviteUserParams[]
	ownerId: string
}

export const MediaListItem = ({ ownerId, participants, onMenuItemClick, showWarning, showPrimaryActionButton, isPrimaryButtonLoading, onPrimaryActionButtonClick, className, ...restProps }: MediaListItemProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const cancelRef = useRef(null);
	const [user, setUser] = React.useState<User>(CurrentUser.get());
	const [access, setAccess] = React.useState<PermissionsType>();
	React.useEffect(() => {
		async function fetchData() {
			try {
				const response = await getUserProfile();
				CurrentUser.set(response.data);
				setUser(response.data);
				const userRole = participants?.find(
					(access) => access?.id === CurrentUser.get()._id,
				)?.role;
				setAccess({isAdmin: userRole === 'admin',
					isEditor: userRole === 'editor',
					isReader: userRole === 'reader',
					isOwner: CurrentUser.get()._id === ownerId,
				});
			} catch (error) {
				console.log('Unable to fetch user ID', error);
			} finally {
			}
		}
		fetchData();
	}, [ownerId, participants, user._id]);



	const handleDelete = () => {
		setIsDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		setIsDeleteDialogOpen(false);
		onSelect("delete");
	};

	const handleCancelDelete = () => {
		setIsDeleteDialogOpen(false);
	};
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
		<>
			<HStack
				shadow='xs'
				p='4'
				bg={showWarning ? 'orange.50' : 'white'}
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
						<Heading cursor="pointer" mb='8px' fontSize='lg' onClick={() => {
							onSelect(access?.isAdmin || access?.isOwner || access?.isEditor ? 'edit' : 'view')
						}}>
							{restProps.name}
						</Heading>
						{access ? <Badge
							mr={'20px'}
							px={'12px'}
							fontSize="12px"
							textTransform={'capitalize'}
							colorScheme={
								access?.isOwner || access?.isAdmin
									? 'green'
									: access?.isEditor
										? 'yellow'
										: 'red'
							}
							w={'fit-content'}
							h={'18px'}
							fontWeight="500"
							variant={'subtle'}
							alignItems="center"
						>
							{access?.isOwner ? 'Owner' : access?.isAdmin
								? 'Admin'
								: access?.isEditor
									? 'Editor'
									: 'Reader'}
						</Badge> : null}
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
								visibility={access?.isAdmin || access?.isOwner || access?.isEditor ? 'visible' : 'hidden'}
								opacity={access?.isAdmin || access?.isOwner || access?.isEditor ? 1 : 0}
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
									onSelect('rename')
								}}>
									Rename
								</MenuItem>
								<MenuItem fontSize="14" textAlign="right" fontWeight="medium" color="gray.600" onClick={handleDelete}>
									Delete
								</MenuItem>
							</MenuList>
						</Menu>}

					</Box>
				</HStack>
			</HStack>
			<AlertDialog
				isOpen={isDeleteDialogOpen}
				leastDestructiveRef={cancelRef}
				onClose={handleCancelDelete}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Delete chatbot?
						</AlertDialogHeader>
						<AlertDialogBody>
							You can't undo this action afterwards.
						</AlertDialogBody>
						<AlertDialogFooter>
							<Button ref={cancelRef} size='sm' onClick={handleCancelDelete}>
								Cancel
							</Button>
							<Button
								size="sm"
								colorScheme="red"
								variant="solid" onClick={handleConfirmDelete} ml={3}>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
};
