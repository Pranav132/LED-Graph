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
            if (email.endsWith('@ashoka.edu.in')) {
              
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

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
