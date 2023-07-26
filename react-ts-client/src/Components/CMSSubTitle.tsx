import { Text, Flex, Button } from "@chakra-ui/react"
import { useContext } from "react";
import AuthContext from "../Providers/Auth";

type titleProps = {
    text: string;
    config: any,
    buttonAction: string,
    icon: any,
    configID: number
}

export const CMSSubTitle = (props: titleProps) => {

    const authCtx = useContext(AuthContext)

    return (
        <Flex justifyContent={"space-between"} pr={"7vw"}>
            <Text
                fontSize={"3xl"}
                py={4}
                px={4}
                fontWeight="bold"
            >
                {props.text}
            </Text>
            <Button leftIcon={props.icon} my={4} mx={4} colorScheme='teal' variant='solid' size="lg"
            // Set the config in auth Context and in local storage, then redirect to visualize page
                onClick={() => {
                    authCtx.setCurrentConfig(props.config, props.configID);
                    window.location.href = "/visualize"
                }}>
                {props.buttonAction}
            </Button>
        </Flex>
    )
}

