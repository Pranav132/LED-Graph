import {
    Box,
    Container,
    Stack,
    Text,
    Link,
    useColorModeValue,
  } from '@chakra-ui/react';
  
  export const Footer = () => {
    return (
      <Box
        color={useColorModeValue('gray.700', 'gray.200')}
        borderTop="1px"
        borderTopColor={"gray.200"}>
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}>
          <Stack direction={'row'} spacing={6}>
            <Link href={'/'}>About</Link>
            <Link href={'/CMS'}>CMS</Link>
            <Link href={'/visualize'}>Visualize</Link>
            <Link href={'/algorithmselector'}>Algorithms</Link>
          </Stack>
          <Text>© LED Graph by Makerspace</Text>
        </Container>
      </Box>
    );
  }