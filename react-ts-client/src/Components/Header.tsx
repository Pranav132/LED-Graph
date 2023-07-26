// TODO: [x] plain header for login
// TODO: [x] main header for CMS, upload, and visualise pages

import AuthContext from "../Providers/Auth";
import { useContext } from "react";

import {
    Box,
    Flex,
    Text,
    Button,
    Stack,
    Link,
    useColorModeValue,
    useBreakpointValue,
  } from '@chakra-ui/react';
  
  export const MainHeader = () => {

    const authCtx = useContext(AuthContext);
  
    return (
      <Box>
        <Flex
          bg={useColorModeValue('white', 'gray.800')}
          color={useColorModeValue('gray.600', 'white')}
          minH={'60px'}
          py={{ base: 2 }}
          px={{ base: 4 }}
          borderBottom={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.900')}
          align={'center'}>
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}>
          </Flex>
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <Text
              textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
              fontWeight={'bold'}
              color={useColorModeValue('gray.800', 'white')}>
              LED Graph
            </Text>
  
            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>
  
          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={6}>
            <Button
              as={'a'}
              display={{ base: 'none', md: 'inline-flex' }}
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'red.500'}
              href={'#'}
              _hover={{
                bg: 'red.600',
              }}
              onClick={() => {authCtx.logout()}}>
              Logout
            </Button>
          </Stack>
        </Flex>
      </Box>
    );
  }
  
  const DesktopNav = () => {
    const linkColor = useColorModeValue('gray.600', 'gray.200');
    const linkHoverColor = useColorModeValue('gray.800', 'white');
  
    return (
      <Stack direction={'row'} spacing={4}>
        {NAV_ITEMS.map((navItem) => (
          <Box key={navItem.label}>
            <Link
              p={2}
              href={navItem.href ?? '#'}
              fontSize={'sm'}
              fontWeight={500}
              color={linkColor}
              _hover={{
                textDecoration: 'none',
                color: linkHoverColor,
              }}>
              {navItem.label}
            </Link>
          </Box>
        ))}
      </Stack>
    );
  };
  
  
  interface NavItem {
    label: string;
    subLabel?: string;
    children?: Array<NavItem>;
    href?: string;
  }
  
  const NAV_ITEMS: Array<NavItem> = [
    {
      label: 'About',
      href: '/',
    },
    {
      label: 'CMS',
      href: '/cms',
    },
    {
      label: 'Visualize',
      href: '/visualize',
    }
  ];