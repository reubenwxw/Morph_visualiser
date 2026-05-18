import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cliDirectory = '/Volumes/DataDrive/new_phd_workfile/gba_data';
const destinationDirectory = path.join(__dirname, '..', 'workfile', 'pmtiles');

// Function to find all files with a specific extension in a directory and its subdirectories
function findFilesByExtension(startPath, filter, callback) {
    if (!fs.existsSync(startPath)) {
        console.log("Directory not found: ", startPath);
        return;
    }

    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            findFilesByExtension(filename, filter, callback); //recurse
        } else if (filename.indexOf(filter) >= 0) {
            callback(filename);
        }
    }
}

// Verify a pmtiles file
function verifyPmtiles(filePath) {
    return new Promise((resolve, reject) => {
        const command = `pmtiles verify "${filePath}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Verification failed for ${filePath}: ${stderr}`);
                reject(error);
                return;
            }
            console.log(`Verification successful for ${filePath}`);
            resolve();
        });
    });
}

// Copy a file to the destination directory
function copyFile(filePath) {
    const fileName = path.basename(filePath);
    const destPath = path.join(destinationDirectory, fileName);
    fs.copyFileSync(filePath, destPath);
    console.log(`Copied ${fileName} to ${destinationDirectory}`);
}

// Main function
async function main() {
    console.log(`Searching for .pmtiles files in ${cliDirectory}...`);

    findFilesByExtension(cliDirectory, '.pmtiles', async (filePath) => {
        try {
            await verifyPmtiles(filePath);
            copyFile(filePath);
        } catch (error) {
            console.error(`Skipping ${filePath} due to verification failure.`);
        }
    });
}

main();
