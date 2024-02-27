import { Badge, Box, Button, IconButton, List, ListItem, Menu, MenuButton, MenuItem, MenuList, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { DeleteIcon } from '../../components/Icons/DeleteIcon';
import { ThreeDotIcon } from '../../components/Icons/ThreeDotIcon';
import { useConfirmation } from '../../providers/providers';
import { deleteUser, InviteUserParams } from '../../services/userServices';
import MemberAddModal from '../MemberAddModal/MemberAddModal';


interface MembersProps {
    participants: {
        id: string;
        email: string;
        role: "admin" | "editor" | "reader";
    }[]
    chatBotId: string;
    onAddParticipant: (data: InviteUserParams) => void
    onDeleteParticipant: (id: string) => void
}

const Members = (
    props: MembersProps
) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { showConfirmation } = useConfirmation()
    const toast = useToast();
    const onDeleteUser = useCallback(async (id: string) => {
        try {
            await deleteUser(props.chatBotId, id)
            toast({
                title: `User have been updated successfully`,
                status: "success",
                isClosable: true,
            });
            props.onDeleteParticipant(id);
        } catch (error) {
            toast({
                title: `Oops! Something went wrong`,
                status: "error",
                isClosable: true,
            });
        }
    }, [props, toast])

    return (
        <Box maxWidth='800px'>
            <Box display='flex' justifyContent='end' mb='5'>
                <Button onClick={onOpen}> Add people</Button>
            </Box>
            <List spacing={3}>
                {props.participants.map(item => {
                    return <ListItem position="relative" key={item.id} display='flex' justifyContent="space-between" alignItems={'center'}>
                        <Box >
                            {item.email || item.id}
                        </Box>
                        <Box display={'flex'} alignItems={'center'}>
                            <Badge
                                mr={'20px'}
                                px={'12px'}
                                fontSize='12px'
                                textTransform={'capitalize'}
                                colorScheme={item.role === 'admin' ? 'blue' : item.role === 'editor' ? 'cyan' : 'teal'}
                                h={'18px'}
                                variant={'subtle'} alignItems='center'>
                                {item.role}
                            </Badge>
                            <Menu placement={'bottom-end'}>
                                <MenuButton
                                    as={IconButton}
                                    aria-label='Options'
                                    icon={<ThreeDotIcon />}
                                    variant='outline'
                                    boxSize={'28px'}
                                    minWidth={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                />
                                <MenuList p={1} minW="140px" color="gray.600">

                                    <MenuItem
                                        fontSize={14}
                                        borderRadius={6}
                                        icon={<DeleteIcon />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            showConfirmation(true, {
                                                title: 'Delete Chat',
                                                content: 'Are you sure you want to delete this user?',
                                                confirmButtonText: 'Delete',
                                                onClose: () => showConfirmation(false),
                                                onConfirm: () => {
                                                    onDeleteUser(item.id);
                                                    showConfirmation(false);
                                                },
                                            })
                                        }}>
                                        Delete user
                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </Box>
                    </ListItem>
                })}

            </List>
            <MemberAddModal chatBotId={props.chatBotId} isOpen={isOpen} onClose={onClose} onAddParticipant={props.onAddParticipant} />
        </Box>
    );
};
export default Members