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
    useToast
  } from '@chakra-ui/react';
import { BsFillPlayFill } from "react-icons/bs"
// import { AiOutlineEdit } from "react-icons/ai"
import { RiDeleteBinLine } from "react-icons/ri"
import { RxTimer } from "react-icons/rx"
import { FcApproval, FcCancel } from "react-icons/fc"
import { CMSSubTitle } from "./CMSSubTitle"
import { sanitiseConfigName, formatDate } from '../Providers/Functions';
import AuthContext from '../Providers/Auth';
import { useState, useEffect, useContext } from "react";


// Icon for run button
const PlayIcon = () => {
    return(
        <Icon fontSize="20" as={BsFillPlayFill} />
    )
}

// REMOVED - ICON FOR EDITING
// const EditIcon = () => {
//     return(
//         <Icon fontSize="20" _hover={{ color: "blue.500"}} as={AiOutlineEdit} />
//     )
// }

// Delete Icon
const DeleteIcon = () => {
    return(
        <Icon fontSize="16" color="red.500" _hover={{ color: "red.600", fontWeight:"bold", fontSize:"20"}} as={RiDeleteBinLine} />
    )
}


type configTableProps = {
    setSection:React.Dispatch<React.SetStateAction<number>> 
  }
  

export const ConfigTable = (props:configTableProps) => {

    const [active, setActive] = useState(0)
    const [loading, setLoading] = useState(false)
    const [configs, setConfigs] = useState<any>(null)
    const authCtx = useContext(AuthContext)
    const toast = useToast();
    
    // Fetch all a user's configs from backend
    const fetchConfigs = () => {
        setLoading(true)
        fetch("http://localhost:4000/configs/" + authCtx.authID + "/",{
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
                        setConfigs(res.data)
                    }
                    else{
                        setConfigs(null)
                    }
                }
                else{
                    console.log("Error")
                }
            }))
    }

    useEffect(() => {
        fetchConfigs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // REMOVED - Code to open editor with selected config
    // function handleEdit(currentConfig:any, configID:number, setSection:React.Dispatch<React.SetStateAction<number>>){
    //     authCtx.setCurrentConfig(currentConfig, configID)
    //     setSection(3)
    // }

    // Delete selected config from backend
    const handleDelete = async (configID:number) => {
        setLoading(true)
        try{
            await fetch("http://localhost:4000/config/" + configID + "/",{
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                authID: authCtx.authID
            })
        }).then(response =>
            {
                if(response.status === 200){
                    toast(
                        {
                            title: "Successfully Deleted",
                            position: "top",
                            duration: 3000,
                            status: "success"
                        }
                    )
                    authCtx.setCurrentConfig({}, -1)
                    setLoading(false)
                    fetchConfigs()
                }
                else{
                    toast({
                        title: "Unable to Delete",
                        position: "top",
                        duration: 3000,
                        status: "error"
                    })
                    setLoading(false) 
                }
            })
        }
        catch(err){
            console.log(err)
            toast({
                title: "Unable to Delete",
                position: "top",
                duration: 3000,
                status: "error"
            })
            setLoading(false)
        }
    }

    return (
        <TableContainer width={"100%"} bg={useColorModeValue('gray.50', 'gray.800')} minHeight={"88vh"}>
            {loading ? (
                <Spinner />
            ) : (
                <>
                { configs ? (
                <>
                <CMSSubTitle text="Configurations" config={configs[active]} configID={configs[active].id} buttonAction="Run" icon={<PlayIcon />}/>
                <Table variant='simple'>
                    <Thead bg={"white"}>
                        <Tr>
                            <Th fontSize={16} py={6} isNumeric w={"5%"}>#</Th>
                            <Th fontSize={16} py={6} w={"30%"}>Name</Th>
                            <Th fontSize={16} py={6} w={"20%"}>Created</Th>
                            {/* <Th fontSize={16} py={6} w={"15%"}>Edit</Th> */}
                            <Th fontSize={16} py={6} w={"15%"}>Validated</Th>
                            <Th fontSize={16} py={6} w={"15%"}>Delete</Th>
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
                                    <Td>{formatDate(config.date)}</Td>
                                    {/* <Td onClick={() => handleEdit(config, config.id, props.setSection)}><EditIcon /></Td> */}
                                    <Td>{config.checked ? config.validated? <FcApproval fontSize={24} /> :<FcCancel fontSize={24} /> : <RxTimer fontSize={20} />}</Td>
                                    <Td onClick={() => {handleDelete(config.id)}}><DeleteIcon /></Td>
                                </Tr>
                            ) : 
                            (
                                <Tr cursor={"pointer"} _hover={{
                                    bg:"gray.200"
                                }}
                                onClick={() => {setActive(index)}}>
                                    <Td>{index+1}</Td>
                                    <Td>{sanitiseConfigName(config.name)}</Td>
                                    <Td>{formatDate(config.date)}</Td>
                                    {/* <Td onClick={() => handleEdit(config, config.id, props.setSection)}><EditIcon /></Td> */}
                                    <Td>{config.checked ? config.validated? <FcApproval fontSize={24} /> :<FcCancel fontSize={24} /> : <RxTimer fontSize={20} />}</Td>
                                    <Td onClick={() => {handleDelete(config.id)}}><DeleteIcon/></Td>
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
