// TODO: [] Upload Section - Validation
// TODO: [] Valid, in Progress, denied Schemas
// TODO: [x] Admin has validate section
// TODO: [x] Run Button on Schema page

import { useState } from 'react'
import { Flex, Text, Box, Icon } from '@chakra-ui/react'
import { Upload } from '../Components/Upload'
import { ConfigTable } from '../Components/ConfigTable'
import AuthContext from '../Providers/Auth'
import { useContext } from 'react'
import { AiOutlineUpload } from "react-icons/ai"
import { VscJson } from 'react-icons/vsc'
import { BsCheck2Circle } from 'react-icons/bs'
// import { Editor } from '../Components/Editor'
// import { AiOutlineEdit } from "react-icons/ai"

// Content Management Section
// Configurations - to see all of a users configs
// Upload Config - To Upload a new configuration
// Validate - FOR ADMINS - Validate configurations, these can be sent to middle ware to run on hardware
// Editor - [REMOVED] - Editor section with JSON formatter

export const CMS = () => {

    const [section, setSection] = useState(0)
    const authCtx = useContext(AuthContext)

    return(
        <Flex>  
        <Flex
            flexDirection={"column"}
            width={"15vw"}
            pt={12}
            borderRight="1px"
            borderRightColor={"gray.200"}
        >
            {/* Content */}
            {/* If section = 0, show table */}
            {/* If section = 1, show upload section */}
            {/* If section = 2 and user is admin, show validate section*/}

            {/* TITLE */}
            <Text fontSize="2xl" fontWeight="bold" pb={8} mx={8}> CMS </Text>

            {/* SIDE NAVBAR */}
            <Text fontSize="lg" cursor={"pointer"} py={4} mr={4} ml={4} pl={4} borderRadius="lg" onClick={() => {setSection(0)}}  _hover={{ bg: 'cyan.400', color: 'white',}}>
                <Icon
                mr="4"
                fontSize="16"
                _groupHover={{
                color: 'white',
                }}
                as={VscJson}
                />
                Configurations
            </Text>

            <Text fontSize="lg" cursor={"pointer"} py={4} mr={4} ml={4} pl={4} borderRadius="lg" onClick={() => {setSection(1)}}  _hover={{ bg: 'cyan.400', color: 'white',}}>    
                <Icon
                mr="4"
                fontSize="16"
                _groupHover={{
                color: 'white',
                }}
                as={AiOutlineUpload}
                />
                New Config
            </Text>

            {/* VALIDATE - Only for Admins */}
            {authCtx.isAdmin && ( 
                <Text fontSize="lg" cursor={"pointer"} py={4} mr={4} ml={4} pl={4} borderRadius="lg" onClick={() => {setSection(2)}}  _hover={{ bg: 'cyan.400', color: 'white',}}>
                    <Icon
                    mr="4"
                    fontSize="16"
                    _groupHover={{
                    color: 'white',
                    }}
                    as={BsCheck2Circle}
                    />
                    Validate
                </Text>
            )}

            {/* EDIT SECTION */}
             {/* <Text fontSize="lg" cursor={"pointer"} py={4} mr={4} ml={4} pl={4} borderRadius="lg" onClick={() => {setSection(3)}}  _hover={{ bg: 'cyan.400', color: 'white',}}>    
                <Icon
                mr="4"
                fontSize="16"
                _groupHover={{
                color: 'white',
                }}
                as={AiOutlineEdit}
                />
                Editor
            </Text> */}
            
        </Flex>

        {/* CONTENT AREA */}
        <Box
            width={"85vw"}
        >
            {section === 0 && (
                <ConfigTable setSection={setSection} />
            )}
            {section === 1 && (
                <Upload setSection={setSection}/>
            )}
            {(authCtx.isAdmin && section === 2) && ( 
                // TODO: Add Validate section
                <h1>Validate</h1>
            )}
             {/* {section === 3 && (
                <Editor />
            )} */}
        </Box>
        </Flex>
    )
}