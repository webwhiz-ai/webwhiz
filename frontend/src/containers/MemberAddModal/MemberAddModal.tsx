import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useToast,
  Text,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import React from 'react';
import { inviteUser, InviteUserParams } from '../../services/userServices';
import { object, string } from 'yup';

interface MemberAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatBotId: string;
  onAddParticipant: (data: InviteUserParams) => void;
  user?: InviteUserParams;
}

export const MemberAddModal = ({
  isOpen,
  onClose,
  chatBotId,
  onAddParticipant,
  user,
}: MemberAddModalProps) => {
  let validationSchema = object().shape({
    email: string().email().required(),
  });
  const toast = useToast();
  const formik = useFormik<InviteUserParams>({
    initialValues: {
      email: user?.email || '',
      role: user?.role || 'admin',
      id: user?.id
    },
    enableReinitialize: true,
    validationSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        await inviteUser(chatBotId, values);
        toast({
          title: `User have been updated successfully`,
          status: 'success',
          isClosable: true,
        });
        onAddParticipant(values);
        onClose();
      } catch (error) {
        toast({
          title: `Oops! Something went wrong`,
          status: 'error',
          isClosable: true,
        });
      }
    },
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent as={'form'} onSubmit={(e: any) => formik.handleSubmit(e)}>
        <ModalHeader>
          <Text>{formik.values.id ? 'Edit Member' : 'Invite Members'}</Text>
          <Text fontSize="15px" color="gray.600" fontWeight="500" mt="2">
            Assign roles & define access privileges for new team members to
            manage chatbot settings and functions.
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={'4'} isRequired>
            <FormLabel fontSize="sm" color="gray.500">
              Email
            </FormLabel>
            <Input
              disabled={!!formik.values.id}
              placeholder={'name@example.com'}
              type="email"
              name={'email'}
              value={formik.values.email}
              onChange={formik.handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm" color="gray.500">
              Access level
            </FormLabel>
            <Select
              cursor="pointer"
              defaultValue={formik.values.role}
              onChange={(e) => formik.setFieldValue('role', e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="reader">Reader</option>
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            colorScheme="ghost"
            variant={'blue'}
            mr={3}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            disabled={!formik.isValid || formik.isSubmitting}
            isLoading={formik.isSubmitting}
            type={'submit'}
            variant="solid"
            colorScheme="blue"
          >
            {formik.values.id ? 'Update' : 'Send invite'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MemberAddModal;
