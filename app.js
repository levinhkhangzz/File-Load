// app.js
require('dotenv').config();
const firebase = require('firebase/app');
require('firebase/storage');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

let randomFilename; // Store the random filename globally

function generateRandomFilename() {
  const getRandomString = () => Math.random().toString(36).substr(2, 5);
  return `${getRandomString()}-${getRandomString()}-${getRandomString()}`;
}

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (file) {
    // Generate a random filename with the original file extension
    const originalFilename = file.name;
    const fileExtension = originalFilename.split('.').pop();
    randomFilename = generateRandomFilename() + '.' + fileExtension;

    const storageRef = storage.ref(`uploads/${randomFilename}`);
    
    // Set the content type based on the file type
    const contentType = file.type;

    const uploadTask = storageRef.put(file, { contentType });

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
      }
    );
  }
}

function downloadFile() {
  // Get the download URL
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
