const dotenv = require('dotenv');

dotenv.config();

function required(key, defaultValue=undefined){
    const value = process.env[key] || defaultValue; 
    // or: 앞의 값이 true로 판별되면 앞의 값이 대입되고 값이 false로 판별되면 뒤에 값이 대입됨
    if(value == null){
        throw new Error(`키 ${key}는 undefined입니다.`);
    }
    return value;
};

const config = {
    db: {
        URI: required('DB_URI').toString(),
        DB_NAME: required('DB_NAME').toString(),
    },
    api: {
        SEOUL_API_KEY: required('SEOUL_API_KEY').toString(),
        PUBLIC_API_KEY: required('PUBLIC_API_KEY').toString(),
    },
    
    jwt: {
        secretKey: required('JWT_SECRET'),
        expiresInSec: parseInt(required('JWT_EXPIRES_SEC', 172800))
    },
    bcrypt: {
        saltRounds: parseInt(required('BCRYPT_SALT_ROUNDS', 10))
    },
    host: {
        port: parseInt(required('HOST_PORT', 8080))
    },
    firebaseconfig:{
        apiKey: required("firebaseapikey"),
        authDomain: required("authDomain"),
        projectId: required("projectId"),
        storageBucket: required("storageBucket"),
        messagingSenderId: required("messagingSenderId"),
        appId: required("appId"),
        measurementId: required("measurementId")
      }
};

module.exports = config;