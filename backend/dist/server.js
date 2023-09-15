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
app.use((0, cors_1.default)({ origin: 'http://localhost:3001' }));
// Define the destination and filename for the uploaded files
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, 'draw-chart'));
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
// Set up Multer with the storage
const upload = (0, multer_1.default)({ storage });
// Route for handling file uploads with format validation
app.post('/upload', upload.single('file'), (req, res) => {
    // Check if a file was uploaded successfully
    if (req.file) {
        const { originalname, mimetype } = req.file;
        console.log(req.file);
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
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
