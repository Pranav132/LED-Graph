import { useRef, useEffect, useState, useContext } from 'react';
import { Spinner, useToast, Button, Flex, Box, Text } from "@chakra-ui/react";
import AuthContext from '../Providers/Auth';
import { getAlgorithm } from '../Providers/Functions';

export const Canvas = () => {

  const authCtx = useContext(AuthContext);
  const [ledColors, setLedColors] = useState(Array(450).fill("#aaa"));
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [initialLedColors, setInitialLedColors] = useState(Array(450).fill("#aaa"));
  const [selectedNodes, setSelectedNodes] = useState<any>([]); 
  const [cursorStyle, setCursorStyle] = useState("default");
  const toast = useToast();

  const currentAlgorithm = getAlgorithm(authCtx.currentAlgorithm);
  if(currentAlgorithm === undefined || currentAlgorithm === null || currentAlgorithm === "") {
    window.location.href = "/algorithmselector";
  }


  const canvasRef = useRef(null);
  let currentColorSetIndex = 1; // Keeps track of the current color set

  const nodeCoordinates: any = {
    0: { x: 400, y: 300 },
    1: { x: 550, y: 300 },
    2: { x: 475, y: 430 },
    3: { x: 325, y: 430 },
    4: { x: 250, y: 300 },
    5: { x: 325, y: 170 },
    6: { x: 475, y: 170 },
    7: { x: 550, y: 560 },
    8: { x: 250, y: 560 },
    9: { x: 100, y: 300 },
    10: { x: 250, y: 40 },
    11: { x: 550, y: 40 },
    12: { x: 700, y: 300 },
    13: { x: 627, y: 425 },
    14: { x: 405, y: 560 },
    15: { x: 177, y: 435 },
    16: { x: 172, y: 174 },
    17: { x: 395, y: 40 },
    18: { x: 623, y: 165 }
  };

  const getAlgorithmLink = (nodeId:number, node2?:number) => {
    if(currentAlgorithm === "bfs" || currentAlgorithm === "dfs"){
      return `http://localhost:4000/${currentAlgorithm}/${nodeId}`;
    }
    else if(currentAlgorithm === "kruskal" || currentAlgorithm === "mapping"){
      return `http://localhost:4000/${currentAlgorithm}`
    }
    else if(currentAlgorithm === "dijkstra"){
      return `http://localhost:4000/${currentAlgorithm}/${nodeId}/${node2}`
    }
    else{
      return "";
    }
  }

  const updateVisualization = (nodeId:number, node2?:number) => {
    setLoading(true); // Assuming you have a setLoading function to show a loading state
    let algoLink:string = "";
    if(currentAlgorithm !== "dijkstra"){
      algoLink = getAlgorithmLink(nodeId);
    }
    else{
      algoLink = getAlgorithmLink(nodeId, node2);
    }
    fetch(algoLink, {
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
        setLoading(false); // Stop showing the loading state
  
        if (res.status === 200) {
          if (res.data) {
            // Assuming setLedColors is your state setter for the ledColors
            setLedColors(JSON.parse(JSON.stringify(res.data)));
            setInitialLedColors(JSON.parse(JSON.stringify(res.data)));
            // Additional logic as required for handling the visualization data
          } else {
            console.log("No data received");
          }
        } else {
          toast({
            title: "Error fetching Visualization.",
            position: "top",
            status: "error",
            duration: 3000,
          });
          console.log("Error in response");
        }
      }))
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching Visualization:", error);
        // Handle error case
      });
  }

  useEffect(() => {
    const canvas: any = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId: number;

    const determineClickedNode = (x:any, y:any) => {
      const nodeRadius = 5;
      const marginOfError = 1.3;
      const effectiveRadius = nodeRadius * marginOfError;

      for (let node in nodeCoordinates) {
        const nodeX = nodeCoordinates[node].x;
        const nodeY = nodeCoordinates[node].y;
        const distance = Math.sqrt(Math.pow(x - nodeX, 2) + Math.pow(y - nodeY, 2));

    
        if (distance <= effectiveRadius) {
          return parseInt(node); // Node number as an integer
        }
      }

      return null;
    };

    const handleCanvasClick = (event:any) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const clickedNode = determineClickedNode(x, y);
      if (clickedNode !== null) {
        if (currentAlgorithm === "dijkstra") {
          if (selectedNodes.length < 2 && !selectedNodes.includes(clickedNode)) {
            setSelectedNodes((prevNodes:any) => [...prevNodes, clickedNode]); // Add node to selectedNodes
          }
        } else {
          updateVisualization(clickedNode); // For other algorithms
        }
      }
    }

    // Add the click event listener if not Kruskal's
    if (currentAlgorithm !== "kruskal") {
      canvas.addEventListener('click', handleCanvasClick);
      setCursorStyle("pointer"); // Set cursor to pointer
    } else {
      setCursorStyle("default"); // Set cursor to default for Kruskal's
    }

    // Function to draw a larger hexagon with LEDs and nodes
    const drawHexagon = (colorSet: string[]) => {

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const sideLength = 300; // Increased for a larger hexagon
      const smallerSideLength = 150;
      const numberOfLEDsPerSide = 30;
      const nodeRadius = 5; // Radius of the nodes
      const ledRadius = 3; // Radius of the LEDs
      const nodePosition = 15; // Position of the node

      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      let ledIndex = 0; // Initialize an index to keep track of the LED

      // Draw a vertex at the center of the larger hexagon
      ctx.beginPath();
      ctx.arc(centerX, centerY, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();


      // Calculate vertices of the bigger hexagon
      let vertices: any = [];
      for (let i = 0; i < 6; i++) {
        vertices.push({
          x: centerX + sideLength * Math.cos((Math.PI / 3) * i),
          y: centerY + sideLength * Math.sin((Math.PI / 3) * i),
        });
      }

      for (let i = 0; i < 6; i++) {
      vertices.push({
        x: centerX + sideLength * Math.cos((Math.PI / 3) * i + (Math.PI / 3)),
        y: centerY + sideLength * Math.sin((Math.PI / 3) * i + (Math.PI / 3)),
      });
    }

      // Calculate vertices of the smaller hexagon inside the bigger hexagon
      let smallerVertices: any = [];
      for (let i = 0; i < 6; i++) {
        smallerVertices.push({
          x: centerX + smallerSideLength * Math.cos((Math.PI / 3) * i),
          y: centerY + smallerSideLength * Math.sin((Math.PI / 3) * i),
        });
      }

      // Draw vertices for the smaller hexagon
      smallerVertices.forEach((vertex: any) => {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
        });

      smallerVertices.forEach((vertex: any) => {
        // Draw LEDs from this vertex to the center node
        for (let j = 1; j <= numberOfLEDsPerSide/2; j++) {
          const ledX = vertex.x + (centerX - vertex.x) * (j / (numberOfLEDsPerSide/2 + 1));
          const ledY = vertex.y + (centerY - vertex.y) * (j / (numberOfLEDsPerSide/2 + 1));
          ctx.beginPath();
          ctx.arc(ledX, ledY, ledRadius, 0, 2 * Math.PI);
          ctx.fillStyle = colorSet[ledIndex];
          // Make sure to increment ledIndex after each LED is drawn
          ledIndex++;
          // Reset the ledIndex when drawing a new frame
          if (ledIndex >= colorSet.length) {
            ledIndex = 0;
          }
          ctx.fill();
        }
      });

        // Calculate midpoints of the sides of the outer hexagon
        let midpoints:any = [];
        for (let i = 0; i < 6; i++) {
          const nextIndex = (i + 1) % 6;
          const midX = (vertices[i].x + vertices[nextIndex].x) / 2;
          const midY = (vertices[i].y + vertices[nextIndex].y) / 2;
          midpoints.push({ x: midX, y: midY });
        }

          // Function to draw a line from a start point to an end point using LEDs
          const drawLine = (start:any, end:any) => {
            for (let j = 1; j <= numberOfLEDsPerSide / 2; j++) {
              const ledX = start.x + (end.x - start.x) * (j / (numberOfLEDsPerSide / 2 + 1));
              const ledY = start.y + (end.y - start.y) * (j / (numberOfLEDsPerSide / 2 + 1));
              ctx.beginPath();
              ctx.arc(ledX, ledY, ledRadius, 0, 2 * Math.PI);
              ctx.fillStyle = colorSet[ledIndex];
              // Make sure to increment ledIndex after each LED is drawn
              ledIndex++;
              // Reset the ledIndex when drawing a new frame
              if (ledIndex >= colorSet.length) {
                ledIndex = 0;
              }
              ctx.fill();
            }
          };

        // Connect each vertex of the inner hexagon to the adjacent midpoints of the outer hexagon
        smallerVertices.forEach((innerVertex:any, index:number) => {
          const outerMidpoint1 = midpoints[index];
          const outerMidpoint2 = midpoints[(index + 5) % 6];

          // Draw line to the first midpoint
          drawLine(innerVertex, outerMidpoint1);

          // Draw line to the second midpoint
          drawLine(innerVertex, outerMidpoint2);
        });

      // Draw the bigger hexagon and add LEDs between each node
      vertices.forEach((vertex: any, index: any) => {
        const nextVertex = vertices[(index + 1) % 6];

        // Draw LEDs between each node
        for (let j = 1; j <= numberOfLEDsPerSide; j++) {
          const ledX = vertex.x + (nextVertex.x - vertex.x) * (j / (numberOfLEDsPerSide + 1));
          const ledY = vertex.y + (nextVertex.y - vertex.y) * (j / (numberOfLEDsPerSide + 1));
          ctx.beginPath();
          ctx.arc(ledX, ledY, ledRadius, 0, 2 * Math.PI);
          ctx.fillStyle = colorSet[ledIndex];
          // Make sure to increment ledIndex after each LED is drawn
          ledIndex++;
          // Reset the ledIndex when drawing a new frame
          if (ledIndex >= colorSet.length) {
            ledIndex = 0;
          }
          ctx.fill();
        }

        // Draw node at the designated position
        const nodeX = vertex.x + (nextVertex.x - vertex.x) * nodePosition / (numberOfLEDsPerSide + 1);
        const nodeY = vertex.y + (nextVertex.y - vertex.y) * nodePosition / (numberOfLEDsPerSide + 1);
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
      });
     
    };

     // Initial draw
     drawHexagon(ledColors[currentColorSetIndex]);

     // Function to update the LED colors at each interval
     const updateLedColors = () => {
       // Update the current color set index
       // eslint-disable-next-line react-hooks/exhaustive-deps
       currentColorSetIndex = (currentColorSetIndex % Object.keys(ledColors).length) + 1;
 
       // Draw the hexagon with the new set of colors
       drawHexagon(ledColors[currentColorSetIndex]);
     };
 
     // Set the interval for updating the colors
     const colorUpdateInterval = 1000; // 1 second for example

     if (!isPaused) {
      const intervalId = setInterval(updateLedColors, colorUpdateInterval);
      
      // Cleanup function to clear the interval and cancel the animation frame
      return () => {
        if (currentAlgorithm !== "kruskal") {
          canvas.removeEventListener('click', handleCanvasClick);
        }
        clearInterval(intervalId);
        cancelAnimationFrame(animationFrameId);
      };
    }
  
  }, [ledColors, isPaused, currentAlgorithm]);

  const handleResetClick = () => {
    setLedColors(initialLedColors); // Reset to initial LED colors
    setIsPaused(false); // Resume the visualization
    currentColorSetIndex = 1; // Reset the color set index
    setSelectedNodes([]);
  };

  useEffect(() => {
    // Check if Dijkstra's algorithm is selected and exactly two nodes are selected
    if (currentAlgorithm === "dijkstra" && selectedNodes.length === 2) {
      updateVisualization(selectedNodes[0], selectedNodes[1]); // Update visualization with the two selected nodes
      setSelectedNodes([]); // Reset the selected nodes
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodes, currentAlgorithm]);

  return (
    <Box bg="black" minH="100vh" p={5}>
      <Flex direction="column" align="center" justify="center">
        {loading ? (
          <Spinner color="teal.500" size="xl" />
        ) : (
          <>
            <Box border="2px solid gray" borderRadius="md" bg="white">
              <canvas ref={canvasRef} width="800" height="600" style={{ cursor: cursorStyle }}  />
            </Box>
            <Flex mt={4} gap={3}>
              <Button colorScheme="blue" onClick={handleResetClick}>
                Reset
              </Button>
              {currentAlgorithm === "kruskal" && (
                <Button colorScheme="green" onClick={() => updateVisualization(0)}>
                  Start Kruskal's Algorithm
                </Button>
              )}
            </Flex>
          </>
        )}
        <Text fontSize="md" color="gray.200" mt={3}>
          Click on a node to start the {currentAlgorithm.toUpperCase()} algorithm.
        </Text>
      </Flex>
    </Box>
  );
}
