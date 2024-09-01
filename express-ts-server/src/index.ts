import express from 'express';
import session from 'express-session';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { Profile } from 'passport-google-oauth20';
import multer, { Multer } from 'multer';
import fs from 'fs';
import path from 'path';
import { Socket } from 'net';
import * as net from 'net';

import { flattenLEDS, generateLedColorsWithVaryingBrightness, ledsToScaledWeights, convertAlgorithmToVisualization, numberOfSides, ledsPerSide, adjacencyList, edges } from './algorithmGeneration';

// admin users authIDs
const adminUsers = ["KRDSBfzWrbd4YNP361NU33WT3lJ3", "115055274696519228448"]

// interface to get user details from request
interface AuthenticatedRequest extends Request {
  user?: Profile;
}

// Set up multer to upload files to the 'uploads' directory
const upload: Multer = multer({ dest: 'uploads/' });

// setting up Prisma Client
const prisma = new PrismaClient();

// serialising user with session
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser(async (user, done) => {
  done(null, user);
});

const app = express();
// UPDATE LIMIT HERE FOR LARGER FILE SIZES
app.use(express.json({ limit: '100mb' }));

// cors
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(cookieParser());

// session secret
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Log in through Google
try{
    passport.use(
        // getting Details from .env and creating google login
        new GoogleStrategy.Strategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: 'http://localhost:4000/auth/google/callback',
          },
          // Getting details from log in
          async (accessToken, refreshToken, profile, done) => {
            const email = profile.emails![0].value;
            
            // if ashokan email
            if (email.endsWith('@ashoka.edu.in') || email.endsWith('@alumni.ashoka.edu.in')) {
              
              // upsert User to MySQL database
              const user = await prisma.user.findUnique({ where: { email } });
      
              if (!user) {
                const newUser = await prisma.user.create({
                  data: {
                    email,
                    name: profile.displayName,
                    googleId: profile.id,
                    tokens: JSON.stringify({ accessToken, refreshToken }),
                  },
                });
                done(null, newUser);
              } else {
                const updatedUser = await prisma.user.update({
                  where: { email },
                  data: {
                    googleId: profile.id,
                    tokens: JSON.stringify({ accessToken, refreshToken }),
                  },
                });
        
                done(null, updatedUser);
              }
            }
            else{
               return done(null);
            }
          }
        )
      );
}
catch(error) {
    if(error.name === 'NonAshokanEmailError'){
       console.log(error.message);
    }
}

function sendDataToPython(data: any) {
  const client = new net.Socket();
  client.connect(8333, '10.42.207.252', () => {
    console.log('Connected to Python server');
    const payload = JSON.stringify(data) + '\n';  // Add '\n' as a delimiter
    client.write(payload);
    client.end();
    console.log('Sent data to Python server');
  });

  client.on('error', (err) => {
    console.error('Connection to Python server failed:', err);
  });
}

function sendDataToPythonTouch(data: any) {
  const client = new net.Socket();
  client.connect(8444, '10.42.207.252', () => {
    console.log('Connected to Python server');
    const payload = JSON.stringify(data) + '\n';  // Add '\n' as a delimiter
    client.write(payload);
    client.end();
    console.log('Sent data to Python server');
  });

  client.on('error', (err) => {
    console.error('Connection to Python server failed:', err);
  });
}


// authenticate with Google
app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

// callback to send to frontend
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?success=1' }),
  // sending to frontend
  async (req: AuthenticatedRequest, res) => {
    try {
    const params = new URLSearchParams(req.user);
    const queryString = params.toString();
      // send the user ID as a response to the front-end
      res.redirect(`http://localhost:3000/login?success=0&${queryString}`);
    } catch (error) {
        console.log(error)
      res.redirect('http://localhost:3000/login?success=0');
    }
  }
);

// get all users - NOT IN USE
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})

// Get a users configs
app.get('/configs/:authID', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        googleId: req.params.authID
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const configs = await prisma.config.findMany({
      where: {
        userID: user.id
      }
    });
    return res.status(200).json(configs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
})

// Admin view - get all configs if user is admin
app.get('/allConfigs/:authID', async (req, res) => {

  try {
    if(!adminUsers.includes(req.params.authID)){
      console.log(req.params.authID)
      console.log(adminUsers)
      return res.status(401).json({ error: 'User is not admin' });
    } 
    const user = await prisma.user.findUnique({
      where: {
        googleId: req.params.authID
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const configs = await prisma.config.findMany({
      include: {
        createdBy: true
      }
    });
    return res.status(200).json(configs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
})

// Upload new config
// Uploads file to uploads directory
app.post('/newConfig', upload.single('File'), async (req, res) => {

  // using multer to get file from form data
  const body = req.body;
 
  // Checking if user available with given authID
  try {
    const user = await prisma.user.findUnique({
      where: {
        googleId: body.authID
      },
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Creating config from given details
    const config = await prisma.config.create({
      data: {
        name: body.name,
        config: req.file ? req.file.filename : null,  // Assuming that the config data is in the file
        userID: user.id,
      },
    })
    console.log('Created config:', config)
    res.status(201).json({ body: 'Post created successfully', config });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// NOT IN USE - Edit config
app.put('/updateConfig/:id', async (req, res) => {
  const configID = parseInt(req.params.id);
  const body = req.body;
  // console.log('Received new Put request:', body);

  try {
    const user = await prisma.user.findUnique({
      where: {
        googleId: body.authID
      },
    })
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const currentConfig = await prisma.config.findUnique({
      where:{
        id: configID
      }
    })
    // console.log(currentConfig.userID)
    if(currentConfig.userID !== user.id) {
      return res.status(401).json({ error: 'User unauthorized to edit this Config' });
    }
    
    const updatedConfig = await prisma.config.update({
      where: {
        id: configID
      },
      data:{config: req.body.config.config}
    })
    res.status(200).json({ body: 'Config Updated', updatedConfig });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }

});

// DELETE CONFIG
app.delete('/config/:id', async (req, res) => {

  const configID = parseInt(req.params.id);
  const body = req.body;

  try {
    // Validating user
    const user = await prisma.user.findUnique({
      where: {
        googleId: body.authID
      },
    })

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // getting config details
    const currentConfig = await prisma.config.findUnique({
      where:{
        id: configID
      }
    })
    
    // checking if user has access to config
    if(currentConfig.userID !== user.id) {
      return res.status(401).json({ error: 'User unauthorized to delete this Config' });
    }

    // deleteing config from db
    const deletedConfig = await prisma.config.delete({
      where: { id: configID },
    });

    // deleting config file from uploads directory
    const configName:any = currentConfig.config;
    const filePath = path.join('uploads', configName);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
        } else {
            console.log("File deleted successfully");
        }
    });

    res.status(200).json({ body: 'Config Deleted', deletedConfig });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
})

// getting config by id
app.get('/config/:id', async (req, res) => {
  const configId = req.params.id;

  try {
    // Retrieve the configuration from the database
    const config = await prisma.config.findUnique({
      where: { id: parseInt(configId) },
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const configName:any = config.config;
    // Assuming the 'config' field of the configuration record is a filename
    const filePath = path.join('uploads', configName);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Send the file contents as JSON
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const fileJson = JSON.parse(fileContents);
    sendDataToPython(fileJson);
    console.log("sent")
    res.json(fileJson);
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
    
});

// to transfer data through socket 
// TODO: Update this
app.get('/transfer/:id', async (req, res) => {

  const client = new Socket();

  const configId = req.params.id;
  const config = await prisma.config.findUnique({
    where: { id: parseInt(configId) },
  });
  const configName:any = config.config;

  client.connect(9999, '127.0.0.1', function() {
      console.log('Connected to Python server');
      
      // Read the file data
      const filePath = path.join(process.cwd(), 'uploads', configName);
      fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
              console.log('Error reading file:', err);
              res.status(500).send('Error reading file');
              return;
          }
          const file = JSON.stringify({ file:data });
          client.write(file);

        // Close the connection after sending the data
        console.log("Sent file")
        client.end();
      });
  });

  client.on('error', function(err) {
    console.log('Error: ', err);
  });

});

// Route to update multiple configs
app.post('/updateConfigs/:authID', async (req, res) => {
  const updates = req.body;

  if(!adminUsers.includes(req.params.authID)){
    console.log(req.params.authID)
    console.log(adminUsers)
    return res.status(401).json({ error: 'User is not admin' });
  } 

  try {
    for (const update of updates) {
      let updateData = {};

      if (update.validated === 'valid') {
        updateData = { checked: true, validated: true };
      } else if (update.validated === 'invalid') {
        updateData = { checked: true, validated: false };
      } else {
        updateData = { checked: false, validated: false };
      }

      await prisma.config.update({
        where: { id: update.id },
        data: updateData,
      });
    }

    res.status(200).json({ message: 'Configs updated successfully.' });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/dfs/:id', async (req, res) => {
  
  const nodeIDString: string = req.params.id;

  // Try converting nodeID to a number
  const nodeID: number = parseInt(nodeIDString, 10);
  
  // Check if the conversion was successful and if nodeID is within the range [0, 18]
  if (isNaN(nodeID) || nodeID < 0 || nodeID > 18) {
    return res.status(400).json({ error: 'Invalid node ID. ID must be a number between 0 and 18' });
  }

  let ledColors = generateLedColorsWithVaryingBrightness(numberOfSides, ledsPerSide);
  const flatLedColors = flattenLEDS(ledColors);

  const edgesWithWeights = ledsToScaledWeights(flatLedColors);

  // Perform DFS on the graph using these weights
  const dfsPath:any = [];
  const visited = new Set();

  const performDFS = (node:any) => {
    visited.add(node);
    const neighbors = adjacencyList[node] || [];
    neighbors.sort((a:number, b:number) => edgesWithWeights[b] - edgesWithWeights[a]); // Sort neighbors by weight in descending order
    
    for (let neighbor of neighbors) {
      const edge = Math.min(node, neighbor) + '-' + Math.max(node, neighbor); // Create a string key for the edge
      if (!visited.has(neighbor)) {
        dfsPath.push(edge);
        performDFS(neighbor);
      }
    }
  };

  // Start DFS from node 0 (or any other starting node of your choice)
  performDFS(nodeID);

  ledColors = convertAlgorithmToVisualization(dfsPath, flatLedColors);

  sendDataToPythonTouch(ledColors);

  return res.json(ledColors);

});

app.get('/bfs/:id', async (req, res) => {
  const nodeIDString: string = req.params.id;

  // Try converting nodeID to a number
  const nodeID: number = parseInt(nodeIDString, 10);
  
  // Check if the conversion was successful and if nodeID is within the range [0, 18]
  if (isNaN(nodeID) || nodeID < 0 || nodeID > 18) {
      return res.status(400).json({ error: 'Invalid node ID. ID must be a number between 0 and 18' });
  }

  let ledColors = generateLedColorsWithVaryingBrightness(numberOfSides, ledsPerSide);
  const flatLedColors = flattenLEDS(ledColors);
  const edgesWithWeights = ledsToScaledWeights(flatLedColors);

  // Perform BFS on the graph using these weights
  const bfsPath = [];
  const visited = new Set();
  const queue = [nodeID];

  while (queue.length > 0) {
      const node = queue.shift(); // Remove the first element from the queue
      visited.add(node);

      const neighbors = adjacencyList[node] || [];
      neighbors.sort((a, b) => edgesWithWeights[b] - edgesWithWeights[a]); // Sort neighbors by weight in descending order

      for (let neighbor of neighbors) {
          const edge = Math.min(node, neighbor) + '-' + Math.max(node, neighbor); // Create a string key for the edge
          if (!visited.has(neighbor)) {
              bfsPath.push(edge);
              visited.add(neighbor);
              queue.push(neighbor);
          }
      }
  }

  ledColors = convertAlgorithmToVisualization(bfsPath, flatLedColors);

  sendDataToPythonTouch(ledColors);

  return res.json(ledColors);
});
app.get('/kruskal', async (req, res) => {
  let ledColors = generateLedColorsWithVaryingBrightness(numberOfSides, ledsPerSide);
  const flatLedColors = flattenLEDS(ledColors);
  const edgesWithWeights = ledsToScaledWeights(flatLedColors);
  const numberOfNodes = 18;

  // Ensure the smaller number is always first in the key
  const edgeNumberToNodePair:any = {};
  Object.keys(edges).forEach(key => {
    const nodes = edges[key].split('-').map(Number);
    edgeNumberToNodePair[`${Math.min(...nodes)}-${Math.max(...nodes)}`] = parseInt(key);
  });

  // Sort the edges by their weight
  const sortedEdges = Object.keys(edgesWithWeights).sort((a, b) => edgesWithWeights[a] - edgesWithWeights[b]).map(edgeNumber => edges[edgeNumber]);

  const mstPath = []; // To store the edges in the MST
  const parent = {}; // To keep track of the connected components

  // Initialize the parent array for each node
  for (let i = 0; i < numberOfNodes; i++) {
      parent[i] = i;
  }

  // Function to find the root of a node
  const find = (node) => {
      while (parent[node] !== node) {
          node = parent[node];
      }
      return node;
  };

  // Function to perform union of two sets
  const union = (node1, node2) => {
      const root1 = find(node1);
      const root2 = find(node2);

      if (root1 !== root2) {
          parent[root1] = root2;
      }
  };

  // Iterate through each edge and add it to the MST if it doesn't form a cycle
  for (let edge of sortedEdges) {
      const [node1, node2] = edge.split('-').map(Number);

      if (find(node1) !== find(node2)) {
          mstPath.push(edge);
          union(node1, node2);
      }
  }

  ledColors = convertAlgorithmToVisualization(mstPath, flatLedColors);

  sendDataToPythonTouch(ledColors);

  return res.json(ledColors);
});

app.get('/dijkstra/:start/:end', async (req, res) => {
  // Extract start and end node IDs from the request parameters
  const startNodeString = req.params.start;
  const endNodeString = req.params.end;

  // Convert node IDs to numbers
  const startNode = parseInt(startNodeString, 10);
  const endNode = parseInt(endNodeString, 10);

  // Check if the conversion was successful and if node IDs are within the valid range
  if (isNaN(startNode) || startNode < 0 || startNode > 18 ||
      isNaN(endNode) || endNode < 0 || endNode > 18) {
    return res.status(400).json({ error: 'Invalid node IDs. IDs must be numbers between 0 and 18' });
  }

  let ledColors = generateLedColorsWithVaryingBrightness(numberOfSides, ledsPerSide);
  const flatLedColors = flattenLEDS(ledColors);
  const edgesWithWeights = ledsToScaledWeights(flatLedColors);

  // Perform Dijkstra's algorithm to find the shortest path
  const dijkstraPath = performDijkstra(adjacencyList, edgesWithWeights, startNode, endNode);

  // Convert the path from Dijkstra's algorithm into a visualization
  ledColors = convertAlgorithmToVisualization(dijkstraPath, flatLedColors);

  sendDataToPythonTouch(ledColors);

  return res.json(ledColors);
});

// perform Dijkstra's algorithm
function performDijkstra(adjacencyList, edgesWithWeights, startNode, endNode) {

  // Ensure the smaller number is always first in the key
  const edgeMapping:any = {};
  Object.keys(edges).forEach(key => {
    const nodes = edges[key].split('-').map(Number);
    edgeMapping[`${Math.min(...nodes)}-${Math.max(...nodes)}`] = parseInt(key);
  });
  
  const distances = {};
  const previous = {};
  const visited = new Set();

  // Initialize all distances as Infinity and previous as null
  for (let node in adjacencyList) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  distances[startNode] = 0;

  while (true) {
    // Find the node with the smallest distance
    let currentNode = null;
    for (let node in distances) {
      if (!visited.has(node) && (currentNode === null || distances[node] < distances[currentNode])) {
        currentNode = node;
      }
    }

    if (currentNode === null) {
      break;
    }

    // Mark the current node as visited
    visited.add(currentNode);

    // Update distances and previous for each neighbor
    const neighbors = adjacencyList[currentNode];

    neighbors.forEach(neighbor => {
      const edgePair = `${Math.min(currentNode, neighbor)}-${Math.max(currentNode, neighbor)}`;
      const edgeNumber = edgeMapping[edgePair];
      const weight = edgesWithWeights[edgeNumber];
      const newDistance = distances[currentNode] + weight;

      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = currentNode;
      }
    });
  }

  // Reconstruct the path
  const path = [];
  let current = endNode;
  while (current !== null && previous[current] !== null) {
    const previousNode = previous[current];
    const edgePair = `${Math.min(previousNode, current)}-${Math.max(previousNode, current)}`;
    path.unshift(edgePair);
    current = previous[current];
  }

  return path;
}

app.get('/mapping', async (req, res) => {
  try {
    // Read canvas.json file
    const filePath = path.join(__dirname, 'canvas.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');

    // Parse JSON and send as response
    const jsonContent = JSON.parse(jsonData);
    sendDataToPythonTouch(jsonContent);
    res.json(jsonContent);
} catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
}  
});


app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
