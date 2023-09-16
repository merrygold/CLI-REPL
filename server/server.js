const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

// Allow requests from any origin (you can change this if needed)
app.use(cors());

// Define the destination and filename for the uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'draw-chart'));
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

// Set up Multer with the storage
const upload = multer({ storage });

// Route for handling file uploads with format validation
app.post('/upload', upload.single('file'), (req, res) => {
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
app.get('/draw-chart/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'draw-chart', filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, return a 404 response
      return res.status(404).json({ message: 'File not found.' });
    }

    // Read the file content
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Handle any error that occurred while reading the file
        return res.status(500).json({ message: 'Internal server error.' });
      }

      // Set the response headers to indicate the file type (e.g., CSV)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Send the file content in the response
      res.send(data);
    });
  });
});

app.delete('/delete-file/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'draw-chart', filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, return a 404 response
      return res.status(404).json({ message: 'File not found.' });
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        // Handle any error that occurred while deleting the file
        return res.status(500).json({ message: 'Internal server error.' });
      }

      // File deleted successfully
      res.status(200).json({ message: 'File deleted successfully.' });
    });
  });
});

app.get('/', (req, res) => {
  res.send('CLI backend Server is Ready.....');
});

app.get('/get', (req, res) => {
  res.send('CLI backend Server is Ready.....');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
