import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  useToast,
  VStack,
  useColorModeValue,
  Heading
} from '@chakra-ui/react';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '../Providers/Auth';

type AlgorithmCardProps = {
  name: string;
  index: number;
  onClick: (index: number) => void;
};

const AlgorithmCard: React.FC<AlgorithmCardProps> = ({ name, index, onClick }) => {
  const cardBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box 
      bg={cardBg}
      p={5}
      borderRadius="xl"
      shadow="xl"
      cursor="pointer"
      transition="all 0.3s ease"
      _hover={{ bg: hoverBg, transform: 'scale(1.05)' }}
      onClick={() => onClick(index)}
    >
      <Text fontSize="2xl" fontWeight="bold" textAlign="center">{name}</Text>
    </Box>
  );
};

export const AlgorithmSelectorGrid: React.FC = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const toast = useToast();
  const authCtx = useContext(AuthContext)

  const algorithms = ['DFS', 'BFS', "Dijkstra's", "Kruskal's", "Mapping"];

  useEffect(() => {
    // Initialize WebSocket connection
    const websocket = new WebSocket('ws://localhost:8555'); // Update URL as needed
    websocket.onopen = () => console.log('WebSocket connected');
    websocket.onerror = error => console.error('WebSocket error:', error);
    websocket.onclose = () => console.log('WebSocket disconnected');

    setWs(websocket);

    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      websocket.close();
    };
  }, []);


  const handleCardClick = (index: number) => {
    const algorithmName = algorithms[index];
    toast({
      title: `Algorithm Selected: ${algorithmName}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top',
    });
    authCtx.setAlgorithm(algorithmName);

    // Send the selected algorithm name via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(algorithmName);
      console.log(`Algorithm sent via WebSocket: ${algorithmName}`);
    } else {
      console.error('WebSocket is not connected.');
    }

    setTimeout(() => {
        window.location.href= '/canvas';
    }, 2000);
  };

  return (
    <VStack spacing={6} minHeight="80vh" justifyContent="center" alignItems="center">
      <Heading mb={4} size="lg">Select an Algorithm</Heading>
      <SimpleGrid columns={{ sm: 2, md: 4 }} spacing={6}>
        {algorithms.map((algorithm, index) => (
          <AlgorithmCard
            key={index}
            name={algorithm}
            index={index}
            onClick={handleCardClick}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
};
