// standardized adjacency list of graph structure
export const adjacencyList:any = {
    0: [1, 2, 3, 4, 5, 6],
    1: [0, 13, 18],
    2: [0, 13, 14],
    3: [0, 14, 15],
    4: [0, 15, 16],
    5: [0, 16, 17],
    6: [0, 17, 18],
    7: [13, 14],
    8: [14, 15],
    9: [15, 16],
    10: [16, 17],
    11: [17, 18],
    12: [18, 13],
    13: [1, 2, 7, 12],
    14: [2, 3, 7, 8],
    15: [3, 4, 8, 9],
    16: [4, 5, 9, 10],
    17: [5, 6, 10, 11],
    18: [6, 1, 11, 12]
  };


// standardized edges
  export const edges:any = {
    "1": "0-1",
    "2": "0-2",
    "3": "0-3",
    "4": "0-4",
    "5": "0-5",
    "6": "0-6",
    "7": "1-13",
    "8": "1-18",
    "9": "2-14",
    "10": "2-13",
    "11": "3-15",
    "12": "3-14",
    "13": "4-16",
    "14": "4-15",
    "15": "5-17",
    "16": "5-16",
    "17": "6-18",
    "18": "6-17",
    "19": "12-13",
    "20": "13-7",
    "21": "7-14",
    "22": "14-8",
    "23": "8-15",
    "24": "15-9",
    "25": "9-16",
    "26": "16-10",
    "27": "10-17",
    "28": "17-11",
    "29": "11-18",
    "30": "18-12"
  };
  
  // Ensure the smaller number is always first in the key
  const edgeMapping:any = {};
  Object.keys(edges).forEach(key => {
    const nodes = edges[key].split('-').map(Number);
    edgeMapping[`${Math.min(...nodes)}-${Math.max(...nodes)}`] = parseInt(key);
  });

export const numberOfSides = 30; // Total number of sides on the graph
export const ledsPerSide = 15; // Number of LEDs per side


// WEIGHT GENERATION

// Function to generate a random weight within a specific range
const generateRandomWeight = () => 0.1 + Math.random() * 0.9;

// Function to adjust brightness based on weight, mapping it from #EEE to #111
const adjustBrightness = (weight:number) => {
 // Map weight: 1 (lightest) corresponds to #CCC (204 in decimal), 0 (darkest) corresponds to #333 (51 in decimal)
 const lightness = Math.floor((204 - 51) * weight) + 51; // #CCC is 204, #333 is 51
 const hexValue = lightness.toString(16).padStart(2, '0');
 return `#${hexValue}${hexValue}${hexValue}`;
}

// Function to generate the LED colors with varying brightness based on weights
export const generateLedColorsWithVaryingBrightness = (numberOfSides:number, ledsPerSide:number) => {
  const ledColorsWithWeights:any = {};

  for (let side = 1; side <= numberOfSides; side++) {
    // Generate a random weight for this side
    const weight = generateRandomWeight();
    
    // Generate the colors for the LEDs on this side
    ledColorsWithWeights[side] = Array.from({ length: ledsPerSide }, () => adjustBrightness(weight));
  }

  return ledColorsWithWeights;
};

// flatten into a single array
export const flattenLEDS = (ledColors:any) => {

    let flatLedColors:any = [];
    for (let i = 1; i <= 30; i++) {
        flatLedColors = flatLedColors.concat(ledColors[i.toString()]);
    }
    return flatLedColors;

}

// JSON Generation 

// First, we convert these colors back to weights
const colorToWeight = (color:any) => {
  const value = parseInt(color.slice(1), 16);
  return ((value - 51) / (204 - 51)).toFixed(2); // Convert back to weight
};

export const ledsToScaledWeights = (flatLedColors) => {

    // Deconstruct the flatLedColors into weights for each edge
    const edgeWeights = flatLedColors.map(colorToWeight);

    // Now we map these weights to the edges based on the list provided
    const condensedEdgeWeights = [];
    for (let i = 0; i < edgeWeights.length; i += ledsPerSide) {
    // Since every 15 values are the same, we can just take the first one from each block
    condensedEdgeWeights.push(edgeWeights[i]);
    }

    // Now we create the edges with weights
    let edgesWithWeights: Record<string, number> = {};
    for (let i = 0; i < condensedEdgeWeights.length; i++) {
    const weight = condensedEdgeWeights[i];
    const edge = i + 1; // Edge numbers are 1-based
    edgesWithWeights[edge] = parseFloat(weight);
    }

    // Find the maximum weight
    const maxWeight = Math.max(...Object.values(edgesWithWeights));

    // Calculate the scale factor
    const scaleFactor = 30 / maxWeight;

    // Now we create the edges with scaled weights
    const edgesWithScaledWeights:any = {};
    Object.keys(edgesWithWeights).forEach(edge => {
    edgesWithScaledWeights[edge] = parseFloat((edgesWithWeights[edge] * scaleFactor).toFixed(2));
    });

    return edgesWithScaledWeights;
}

export const convertAlgorithmToVisualization = (dfsPath:any, flatLedColors: any) => {
    // Initialize the visualization with all LEDs set to their initial colors
    const visualizationJson:any = {};

    // Create an initial state with all LEDs in their initial color
    let currentLedState = [...flatLedColors];


    for (let i = 0; i < dfsPath.length; i++) {
        // Extract the edge number from the edge string "node-node"
        const edgeNodes = dfsPath[i].split('-');
        const edgeNumber = parseInt(edgeNodes[0]) < parseInt(edgeNodes[1]) ? 
                            `${edgeNodes[0]}-${edgeNodes[1]}` : 
                            `${edgeNodes[1]}-${edgeNodes[0]}`;
        
        // Find the index of this edge in edgesWithWeights to determine its corresponding LEDs
        const edgeIndex = edgeMapping[edgeNumber] - 1

        // Calculate the start and end indices for the LEDs of this edge
        const startLedIndex = edgeIndex * 15;
        const endLedIndex = startLedIndex + 15;

        // Set the LEDs for this edge to red in the current state
        for (let j = startLedIndex; j < endLedIndex; j++) {
            currentLedState[j] = '#ff0000';
        }

        // Add the current state to the visualization JSON for this step
        visualizationJson[i + 1] = [...currentLedState];
    }
    
    return visualizationJson;
}

