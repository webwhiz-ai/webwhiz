import { Box, Flex, Icon, IconButton, Text, VStack } from '@chakra-ui/react'
import { useField } from 'formik'
import React from 'react'
import { useDropzone } from 'react-dropzone'
import { FiTrash, FiUpload } from 'react-icons/fi'

type CustomDropzoneProps = {
    name: string;
    label?: string;
    helperText?: string;
}

const CustomDropzone = ({name, label, helperText}: CustomDropzoneProps) => {

    const [field, meta, helpers] = useField(name);

    const handleDrop = (acceptedFiles: File[]) => {
        if(acceptedFiles.length > 5) {
            helpers.setError('You can only upload a maximum of 5 files');
            console.log(meta.error);
            return;
        }
        console.log(name);
        helpers.setValue([...field.value, ...acceptedFiles]);
        console.log(field.value.length);
      };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        accept: {
            'text/html': ['.html'],
            'application/pdf': ['.pdf'],
            'application/vdn.openxmlformats-officedocument.wordprocessingml.document': ['.docx', '.doc'],
            'application/ms-word': ['.docx', '.doc'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
        },
        multiple: true,
        // maxFiles: 5,
    });

    return (
        <Box>
            <Text mb={2} color="gray.700" fontSize="sm">{label}</Text>
            <Box
                w="100%"
                justify="center"
                align="center"
                p={5}
                borderWidth={2}
                borderRadius="lg"
                textAlign="center"
                _focus={{
                    outline: "none",
                    borderColor: "blue.500",
                }}
                {...getRootProps()}>
                <input {...getInputProps()} />
                <Icon as={FiUpload} w={10} h={10} p={2} mb={2} />
                {isDragActive ? (
                    <Text fontSize="sm" color="gray.500">Drop the files here ...</Text>
                ) : (
                        <Text fontSize="sm" color="gray.500">Drag 'n' drop some files here, or click to select files</Text>
                    )}
                {meta.error ? (
                    <Text fontSize="sm" color="red.400">{meta.error}</Text>
                ) : null}

            </Box>
            <Text mt={2} fontSize="sm" color="gray.400">{helperText}</Text>
            <Box
                mt={4}
                h="320px"
                overflowY="auto">
                {field.value.length > 0 && (
                    <VStack mt={4} align="stretch" spacing={2} >
                        {field.value.map((file: File, index: number) => (
                            <Flex key={index} align="center" justifyContent="space-between" borderBottom="1px" borderColor="gray.200" p={2}>
                                <Text fontSize="sm">{file.name}</Text>
                                <IconButton
                                    aria-label="Delete file"
                                    ml={2}
                                    size="xs"
                                    icon={<FiTrash />}
                                    onClick={() => {
                                        const updatedFiles = [...field.value];
                                        updatedFiles.splice(index, 1);
                                        helpers.setValue(updatedFiles);
                                    }}
                                />
                            </Flex>
                        ))}
                    </VStack>
                )}
            </Box>
            
        </Box>
       
    )
}

export default CustomDropzone