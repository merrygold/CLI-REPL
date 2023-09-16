"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3000;
// Allow requests from your frontend domain (http://localhost:3001 in this case)
// app.use(cors({ origin: 'http://localhost:3001' }));
app.use((0, cors_1.default)({ origin: '*' }));
// Define the destination and filename for the uploaded files
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, 'draw-chart'));
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`);
    },
});
// Set up Multer with the storage
const upload = (0, multer_1.default)({ storage });
// Route for handling file uploads with format validation
app.post('/upload', upload.single('file'), (req, res) => {
    // Check if a file was uploaded successfully
    if (req.file) {
        const { originalname, mimetype } = req.file;
        // Check if the uploaded file has the CSV mimetype
        if (mimetype === 'text/csv') {
            res.status(200).json({ message: `${originalname} has been uploaded successfully.` });
        }
        else {
            // If the mimetype is not CSV, delete the uploaded file and return an error
            const filePath = path_1.default.join(__dirname, 'draw-chart', req.file.filename);
            fs_1.default.unlinkSync(filePath); // Delete the file
            res.status(400).json({ message: 'Only CSV files are allowed.' });
        }
    }
    else {
        res.status(400).json({ message: 'No file uploaded.' });
    }
});
// Serve uploaded files
app.get('/draw-chart/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path_1.default.join(__dirname, 'draw-chart', filename);
    // Check if the file exists
    fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, return a 404 response
            return res.status(404).json({ message: 'File not found.' });
        }
        // Read the file content
        fs_1.default.readFile(filePath, (err, data) => {
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
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
