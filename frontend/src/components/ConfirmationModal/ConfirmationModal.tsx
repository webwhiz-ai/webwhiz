import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { ReactNode, useState, useEffect } from 'react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: ReactNode | string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
}: ConfirmationModalProps) => {
  const [disableConfirmationBtn, setDisableConfirmationBtn] = useState(false);
  const onConfirmation = () => {
    setDisableConfirmationBtn(true);
    onConfirm();
  };
  useEffect(() => {
    setTimeout(() => {
      setDisableConfirmationBtn(false);
    }, 200);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{content}</ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose}>
            {cancelButtonText}
          </Button>
          <Button
            disabled={disableConfirmationBtn}
            colorScheme="red"
            onClick={onConfirmation}
          >
            {confirmButtonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
