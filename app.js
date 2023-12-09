// app.js
const firebase = require('firebase/app');
require('firebase/storage');
require('firebase/database'); // Add this line for Realtime Database
const fs = require('fs');

// Load Firebase configuration from the JSON file
const firebaseConfigJson = fs.readFileSync('config.json');
const firebaseConfig = JSON.parse(firebaseConfigJson);

firebase.initializeApp(firebaseConfig);
console.log('Firebase initialized successfully');

const storage = firebase.storage();
const database = firebase.database(); // Initialize Realtime Database

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (file) {
    const storageRef = storage.ref(`uploads/${file.name}`);
    
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
          filename: file.name,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        });
      }
    );
  }
}

function downloadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (file) {
    const storageRef = storage.ref(`uploads/${file.name}`);
    storageRef.getDownloadURL().then((downloadURL) => {
      // Create a hidden link and trigger the click event
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = file.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
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
