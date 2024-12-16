// Firebase SDK 스크립트 로드
importScripts('https://www.gstatic.com/firebasejs/9.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.0/firebase-messaging-compat.js');
const config = require("../server/config")

// Firebase 앱 초기화
const firebaseConfig = ({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId
});
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // FCM 메시지에서 제목과 내용 추출
  const { title, body } = payload.notification;

  if(!title && body){
    return console.log("메세지 입력")
  }
  console.log('Title:', title);
  console.log('Body:', body);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };


  // 브라우저 알림 표시
  self.registration.showNotification(notificationTitle, notificationOptions);
});
