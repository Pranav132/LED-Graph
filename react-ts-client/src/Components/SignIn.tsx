import {
    Flex,
    Stack,
    Button,
    Heading,
    useColorModeValue,
} from '@chakra-ui/react';

export const SignInCard = () => {
    
    return (
        <Flex
            minH={'100vh'}
            align={'center'}
            justify={'center'}
            textAlign={'center'}
            bg={useColorModeValue('gray.50', 'gray.800')}>
            <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'6xl'} textAlign={'center'}>
                        LED Graph
                    </Heading>
                </Stack>
                <Flex       
                align={'center'}
                justify={'center'}>
                <Button
                loadingText="Submitting"
                size="lg"
                bg={'blue.400'}
                color={'white'}
                width={48}
                _hover={{
                    bg: 'blue.500',
                }}
                onClick={() => window.location.href = 'http://localhost:4000/auth/google'}>
                Sign in with Google 
                </Button>
                </Flex>
            </Stack>
        </Flex>
    );
}
