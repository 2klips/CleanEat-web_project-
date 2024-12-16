import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js"; 
import { getMessaging, getToken, deleteToken} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js";

  const firebaseConfig = ({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId
  });

    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    window.requestToken = () => {
    function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // Get registration token
        getToken(messaging).then((currentToken) => {
          if (currentToken) {
            console.log('Received registration token:', currentToken);
            localStorage.setItem('currentToken', currentToken);
          } else {
            console.log('No registration token available.');
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token:', err);
        });
      } else {
        console.log('Notification permission denied.');
      }
    });
  }

  // Call requestPermission function to request notification permission
  requestPermission();
};

window.deleteToken = () => {
    getToken(messaging).then((currentToken) => {
        if (currentToken) {
            deleteToken(messaging, currentToken).then(() => {
                localStorage.removeItem('currentToken');
                console.log('Token deleted.');
            }).catch((err) => {
                console.log('An error occurred while deleting the token:', err);
            });
        } else {
            console.log('No registration token available to delete.');
        }
    }).catch((err) => {
        console.log('An error occurred while retrieving token:', err);
    });
};
