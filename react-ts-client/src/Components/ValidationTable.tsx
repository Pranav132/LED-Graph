import {
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody, 
    Td, 
    useColorModeValue,
    Spinner,
    Flex,
    Icon,
    useToast,
    Checkbox,
    Button,
    Text
  } from '@chakra-ui/react';
import { BsFillPlayFill } from "react-icons/bs"
import { AiFillSave } from "react-icons/ai"
import { sanitiseConfigName, formatDate } from '../Providers/Functions';
import AuthContext from '../Providers/Auth';
import { useState, useEffect, useContext } from "react";

type validationTableProps = {
    setSection:React.Dispatch<React.SetStateAction<number>> 
  }
  

export const ValidationTable = (props:validationTableProps) => {

    const [active, setActive] = useState(0)
    const [loading, setLoading] = useState(false)
    const [configs, setConfigs] = useState<any>(null)
    const authCtx = useContext(AuthContext)
    const toast = useToast();

    // Icon for run button
    const PlayIcon = () => {
        return(
            <Icon fontSize="20" as={BsFillPlayFill} />
        )
    }

    const SaveIcon = () => {
        return(
            <Icon fontSize="20" as={AiFillSave} />
        )
    }
    
    // Fetch all a user's configs from backend
    const fetchConfigs = () => {
        setLoading(true)
        fetch("http://localhost:4000/allConfigs/" + authCtx.authID + "/",{
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response) => 
            response.json()
            .then((data) => ({
                data: data,
                status: response.status,
            }))
            .then((res) => {
                setLoading(false)
                if(res.status === 200) {
                    if(res.data.length !== 0){
                        const transformedData = res.data.map((config: any) => ({
                            ...config,
                            validChecked: config.validated, 
                            invalidChecked: !config.validated && config.checked
                        }));
                        console.log(transformedData)
                        setConfigs(transformedData)
                    }
                    else{
                        setConfigs(null)
                    }
                }
                else{
                    console.log("Error")
                    toast({
                        title: "Unable to fetch configs",
                        position: "top",
                        duration: 3000,
                        status: "error"
                    })
                }
            }))
    }

    useEffect(() => {
        fetchConfigs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCheckboxChange = (type: 'valid' | 'invalid', index: number) => {
        const updatedConfigs = [...configs];
        const currentConfig = updatedConfigs[index];
        
        if (type === 'valid') {
          currentConfig.validChecked = !currentConfig.validChecked;
          currentConfig.invalidChecked = false; // Ensure invalid checkbox is unchecked
        } else {
          currentConfig.invalidChecked = !currentConfig.invalidChecked;
          currentConfig.validChecked = false;  // Ensure valid checkbox is unchecked
        }
        
        currentConfig.checked = currentConfig.validChecked || currentConfig.invalidChecked;
      
        setConfigs(updatedConfigs);
      };

      const handleSave = () => {

        const checkboxStates = configs.map((config:any) => ({
          id: config.id,
          validated: config.validChecked ? 'valid' : (config.invalidChecked ? 'invalid' : false),
          checked: config.checked
        }));

        setLoading(true)
      
        fetch("http://localhost:4000/updateConfigs/" + authCtx.authID + "/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(checkboxStates),
        })
          .then((response) => response.json())
          .then((data) => {
            setLoading(false)
            console.log(data)
                if(data.message === "Configs updated successfully.") {
                    toast({
                        title: data.message,
                        position: "top",
                        duration: 3000,
                        status: "success"
                    })
                }
                else{
                    console.log("Error")
                    toast({
                        title: "Unable to update configs",
                        position: "top",
                        duration: 3000,
                        status: "error"
                    })
                }   
          });
      };

    return (
        <TableContainer width={"100%"} bg={useColorModeValue('gray.50', 'gray.800')} minHeight={"88vh"}>
            {loading ? (
                <Spinner />
            ) : (
                <>
                { configs ? (
                <>
                <Flex justifyContent={"space-between"} pr={"4vw"}>
                    <Text
                        fontSize={"3xl"}
                        py={4}
                        px={4}
                        fontWeight="bold"
                    >
                        Validate
                    </Text>
                    <Flex>
                    <Button leftIcon={<PlayIcon />} my={4} mx={4} colorScheme='teal' variant='solid' size="lg"
                    // Set the config in auth Context and in local storage, then redirect to visualize page
                        onClick={() => {
                            authCtx.setCurrentConfig(configs[active], configs[active].id);
                            window.location.href = "/visualize"
                        }}>
                        Run
                    </Button>
                    <Button leftIcon={<SaveIcon />} my={4} mx={4} colorScheme='teal' variant='solid' size="lg"
                     onClick={handleSave}>
                        Save
                    </Button>
                    </Flex>
                </Flex>
                <Table variant='simple'>
                    <Thead bg={"white"}>
                        <Tr>
                            <Th fontSize={16} py={6} isNumeric w={"5%"}>#</Th>
                            <Th fontSize={16} py={6} w={"35%"}>Name</Th>
                            <Th fontSize={16} py={6} w={"20%"}>User</Th>
                            <Th fontSize={16} py={6} w={"20%"}>Created</Th>
                            <Th fontSize={16} py={6} w={"10%"}>Valid</Th>
                            <Th fontSize={16} py={6} w={"10%"}>Invalid</Th>
                        </Tr>
                    </Thead>
                <Tbody>
                    {configs.map((config: any, index: number) => (
                        // Highlight active (Selected) config
                        (index === active ? 
                            (
                                <Tr cursor={"pointer"} bg="gray.300" onClick={() => {setActive(index)}}>
                                    <Td>{index+1}</Td>
                                    <Td>{sanitiseConfigName(config.name)}</Td>
                                    <Td>{config.createdBy.name}</Td>
                                    <Td>{formatDate(config.date)}</Td>
                                    <Td>
                                        <Checkbox
                                        borderColor="#333"
                                        isChecked={config.validChecked}
                                        onChange={() => handleCheckboxChange('valid', index)}
                                        />
                                    </Td>
                                    <Td>
                                        <Checkbox
                                        borderColor="#333"
                                        isChecked={config.invalidChecked}
                                        onChange={() => handleCheckboxChange('invalid', index)}
                                        />
                                    </Td>
                                </Tr>
                            ) : 
                            (
                                <Tr cursor={"pointer"} _hover={{
                                    bg:"gray.200"
                                }}
                                onClick={() => {setActive(index)}}>
                                    <Td>{index+1}</Td>
                                    <Td>{sanitiseConfigName(config.name)}</Td>
                                    <Td>{config.createdBy.name}</Td>
                                    <Td>{formatDate(config.date)}</Td>
                                    <Td><Checkbox borderColor="#333" /></Td>
                                    <Td><Checkbox borderColor="#333" /></Td>
                                </Tr>
                            ))
                    ))}
                    </Tbody>
                </Table>
            </>
            ) :
            (
                <Flex height="85vh" width="100%" justifyContent="center" alignItems="center" fontWeight="bold" fontSize="xl">No configurations found.</Flex>
            )
            }
            </>
            )}
        </TableContainer>
    )
}
