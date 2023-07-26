import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  Stack,
  useColorModeValue,
  VStack,
  Text,
  useToast
} from '@chakra-ui/react';
import { useState, useContext } from 'react';
import badWords from "bad-words";
import AuthContext from '../Providers/Auth';

type uploadProps = {
  setSection:React.Dispatch<React.SetStateAction<number>> 
}

export const Upload = (props:uploadProps) => {

  const [name, setName] = useState("")
  const toast = useToast()

  // npm package to filter vulgar words
  const filter = new badWords();

  const authCtx = useContext(AuthContext)

  // to handle file uploads
  const [selectedFile, setSelectedFile] = useState<any>();
  const [isSelected, setIsSelected] = useState(false);
  const changeHandler = (event:any) => {
    setSelectedFile(event.target.files[0]);
    setIsSelected(true);
  };

  // send file to backend to finish upload
  const handleSubmission = () => {
    const formData = new FormData();

    formData.append("File", selectedFile);
    formData.append("name", name);
    formData.append("authID", authCtx.authID);

    // Filter vulgar words
    if (filter.isProfane(name)) {
      toast({
        title: "Name contains profanity. Please choose a different word",
        position: "top",
        status: "error",
        duration: 3000,
    }); // Show an alert if input contains bad words
    } else {
      if(name === "") {
        toast({
          title: "Please enter a name",
          position: "top",
          status: "error",
          duration: 3000,
        })
      }
      else{
        // sending form data with file 
        fetch("http://localhost:4000/newConfig/", {
          method: "POST",
          body: formData
        }).then(response => {
          if (response.status === 201) {
            response.json()
            .then(data => 
              {
                toast({
                  title: "Configuration Created!",
                  position: "top",
                  status: "success",
                  duration: 3000,
                });
                setName("");
                authCtx.setCurrentConfig(data.config, data.config.id);
                props.setSection(0)
            });
          }
        });
      }
    }
  };


  return (
    <Flex
      bg={useColorModeValue('gray.100', 'gray.900')}
      align="center"
      justify="center"
      id="contact"
      minHeight="85vh">
      <Box
        borderRadius="lg"
        m={{ base: 5, md: 16, lg: 10 }}
        p={{ base: 5, lg: 16 }}>
        <Box>
          <VStack spacing={{ base: 4, md: 8, lg: 20 }}>
            <Heading
              fontSize={{
                base: '4xl',
                md: '5xl',
              }}>
              New Configuration
            </Heading>

            <Stack
              spacing={{ base: 4, md: 8, lg: 20 }}
              direction={{ base: 'column', md: 'row' }}
              width={"100%"}>

              <Box
                bg={useColorModeValue('white', 'gray.700')}
                borderRadius="lg"
                p={8}
                color={useColorModeValue('gray.700', 'whiteAlpha.900')}
                shadow="base"
                width={"100%"}>
                <VStack spacing={5}>
                  <FormControl isRequired pb={6}>
                    <FormLabel py={4}>Config Name</FormLabel>

                    <InputGroup>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Name"
                        isRequired
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>

                  <Box>
                    <Input type="file" name="file" onChange={changeHandler} border={"none"} />
                    {isSelected ? (
                      <Box>
                        <Button onClick={handleSubmission} my="4">Submit</Button>
                      </Box>
                    ) : (
                      <Text py="4" px="2">Select a file to show details</Text>
                    )}
                  </Box>
                </VStack>
              </Box>
            </Stack>
          </VStack>
        </Box>
      </Box>
    </Flex>
  );
}