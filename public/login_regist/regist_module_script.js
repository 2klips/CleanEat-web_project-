// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = ({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId
  });


// 회원가입에서 번호인증 할 때는 아래의 const firebaseConfig를 적용할 것.


/* const firebaseConfig = {
    apiKey: "AIzaSyCMBEKr3tiM0Uy0TcBkcL7FKHhHpcLMP5Q",
    authDomain: "longin-edit.firebaseapp.com",
    projectId: "longin-edit",
    storageBucket: "longin-edit.appspot.com",
    messagingSenderId: "1000946770228",
    appId: "1:1000946770228:web:1fd78b916dd2dd308e4561",
    measurementId: "G-ZY0HKETRMZ"
  };
 */


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithPhoneNumber, RecaptchaVerifier  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
const auth = getAuth();
auth.languageCode = 'ko';
document.getElementById('googleLogin').addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            console.log(result)
            // IdP data available using getAdditionalUserInfo(result)
            // ...
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.log(error)
            // ...
        });
}) 
window.recaptchaVerifier = new RecaptchaVerifier
    (auth, 'phoneNumberButton', {
    'size': 'invisible',
    'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        onSignInSubmit();
    }
    });

    document.getElementById('phoneNumberButton').
    addEventListener('click', (event) => {
        event.preventDefault()

        const phoneNumber = document.getElementById('phoneNumber').value
        const appVerifier = window.recaptchaVerifier;

        signInWithPhoneNumber(auth, '+82'+phoneNumber, appVerifier)
            .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
            console.log(confirmationResult)
            // ...
            }).catch((error) => {
                console.log(error)
            // Error; SMS not sent
            // ...
            });

    })

    document.getElementById('confirmCodeButton').
    addEventListener('click', (event) => {
        event.preventDefault()

        const code = document.getElementById('confirmCode').value
        confirmationResult.confirm(code).then((result) => {
        // User signed in successfully.
        const user = result.user;
        console.log(result);
        showModal("인증이 완료되었습니다");
        // ...
        }).catch((error) => {
            console.log(error);
            showModal("인증번호를 확인해주세요");
            confirmCode.value = '';
        // User couldn't sign in (bad verification code?)
        // ...
        });

    });

    function showModal(message) {
        const modal = document.getElementById('modal');
        const modalContent = modal.querySelector('.popup-content');
        modalContent.querySelector('p').innerText = message;
        modal.style.display = 'block';
    
        const modalCloseButton = modalContent.querySelector('.close-popup');
        modalCloseButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

document.getElementById('RegisterSubmit').addEventListener('click', (event) => {
    event.preventDefault()
    const signUpEmail = document.getElementById('signUpEmail').value
    const signUpPassword = document.getElementById('signUpPassword').value

    createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
        .then((userCredential) => {
            console.log(userCredential)
            // Signed in 
            const user = userCredential.user;
            // ...
            
        })

        .catch((error) => {
            console.log('회원가입 실패');
            let errorMessage;

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = '모든 칸을 입력해주세요.';
            } else {
                errorMessage = '모든 칸을 입력해주세요';
            }

            const popup = document.createElement('div');
            popup.classList.add('popup');
            popup.innerHTML = `
                <div class="popup-content">
                    <p>${errorMessage}</p>
                    <button class="close-popup">닫기</button>
                </div>
            `;
            document.body.appendChild(popup);

            const closePopupBtn = popup.querySelector('.close-popup');
            closePopupBtn.addEventListener('click', () => {
                popup.remove();
            });
        });
            });

    document.getElementById('signInButton').addEventListener('click', (event) => {
        event.preventDefault()
        const signInEmail = document.getElementById('signInEmail').value
        const signInPassword = document.getElementById('signInPassword').value
        signInWithEmailAndPassword(auth, signInEmail, signInPassword)
            .then((userCredential) => {
                // Signed in 
                console.log(userCredential)
                const user = userCredential.user;
                // ...
            })
            .catch((error) => {
                console.error('Firebase Error:', error);
                const errorCode = error.code;
                let errorMessage;
                if (errorCode === 'auth/email-already-in-use') {
                    errorMessage = '이미 사용 중인 이메일입니다.';
                } else {
                    errorMessage = '오류가 발생했습니다. 다시 시도해주세요.';
                }
                document.getElementById('errorPopup').style.display = 'block';
                document.getElementById('errorMessage').innerText = errorMessage;
            });
            });