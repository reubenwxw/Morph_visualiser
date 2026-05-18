import fs from 'fs';
import path from 'path';

const sourceDirectory = '/Volumes/DataDrive/new_phd_workfile/gba_data';
const destinationDirectory = path.join(process.cwd(), 'workfile', 'catchment');

// Function to find all files ending with a specific string
function findAndCopyFiles(startPath, filter, destPath) {
    if (!fs.existsSync(startPath)) {
        console.log("Source directory not found: ", startPath);
        return;
    }

    const files = fs.readdirSync(startPath);
    for (const file of files) {
        const filename = path.join(startPath, file);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            findAndCopyFiles(filename, filter, destPath); // recurse
        } else if (filename.endsWith(filter)) {
            const destFilePath = path.join(destPath, path.basename(filename));
            fs.copyFileSync(filename, destFilePath);
            console.log(`Copied ${filename} to ${destFilePath}`);
        }
    }
}

// Main function
function main() {
    console.log(`Searching for _catchment.geojson files in ${sourceDirectory}...`);
    findAndCopyFiles(sourceDirectory, '_catchment.geojson', destinationDirectory);
    console.log('Finished copying files.');
}

main();
