import express, { Request, Response } from 'express';
import multer, { Multer } from 'multer';
import path from 'path';
import fs from 'fs';
import cors from'cors';


const app = express();
const port = 3000;


// Allow requests from your frontend domain (http://localhost:3001 in this case)
app.use(cors({ origin: 'http://localhost:3001' }));


// Define the destination and filename for the uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'draw-chart'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Set up Multer with the storage
const upload: Multer = multer({ storage });

// Route for handling file uploads with format validation
app.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  // Check if a file was uploaded successfully
  if (req.file) {
    
    const { originalname, mimetype } = req.file;
    // Check if the uploaded file has the CSV mimetype
    if (mimetype === 'text/csv') {
      res.status(200).json({ message: `${originalname} has been uploaded successfully.` });
    } else {
      // If the mimetype is not CSV, delete the uploaded file and return an error
      const filePath = path.join(__dirname, 'draw-chart', req.file.filename);
      fs.unlinkSync(filePath); // Delete the file
      res.status(400).json({ message: 'Only CSV files are allowed.' });
    }
  } else {
    res.status(400).json({ message: 'No file uploaded.' });
  }
});

// Serve uploaded files
app.use('/draw-chart/:filename', (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'draw-chart', filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, return a 404 response
      return res.status(404).json({ message: 'File not found.' });
    }

    // Serve the file using express.static
    express.static(path.join(__dirname, 'draw-chart'))(req, res, next);
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
