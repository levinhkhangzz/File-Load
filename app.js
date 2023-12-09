// app.js
const firebase = require('firebase/app');
require('firebase/storage');
require('firebase/database'); // Add this line for Realtime Database
const fs = require('fs');

// Load Firebase configuration from the JSON file
const firebaseConfigJson = fs.readFileSync('firebase-config.json');
const firebaseConfig = JSON.parse(firebaseConfigJson);

firebase.initializeApp(firebaseConfig);
console.log('Firebase initialized successfully');

const storage = firebase.storage();
const database = firebase.database(); // Initialize Realtime Database

let randomFilename;

function generateRandomFilename() {
  const getRandomString = () => Math.random().toString(36).substr(2, 5);
  return `${getRandomString()}-${getRandomString()}-${getRandomString()}`;
}

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (file) {
    randomFilename = generateRandomFilename();
    const storageRef = storage.ref(`uploads/${randomFilename}`);
    
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const uploader = document.getElementById('uploader');
        uploader.value = progress;
      },
      (error) => {
        console.error('Error uploading file:', error);
      },
      () => {
        const uploader = document.getElementById('uploader');
        uploader.style.display = 'none';

        // Display the success section
        const successSection = document.getElementById('successSection');
        successSection.style.display = 'block';

        // Store file information in Realtime Database
        database.ref('uploads').push({
          filename: randomFilename,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        });
      }
    );
  }
}

function downloadFile() {
  const storageRef = storage.ref(`uploads/${randomFilename}`);
  storageRef.getDownloadURL().then((downloadURL) => {
    // Create a hidden link and trigger the click event
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = randomFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

function resetUpload() {
  // Reset the input file and hide the success section
  const fileInput = document.getElementById('fileInput');
  const uploader = document.getElementById('uploader');
  const successSection = document.getElementById('successSection');

  fileInput.value = ''; // Reset file input
  uploader.value = 0; // Reset progress bar
  uploader.style.display = 'block'; // Show progress bar
  successSection.style.display = 'none'; // Hide success section
}
