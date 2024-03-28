import JSEncrypt from 'jsencrypt'
import cryptoJs from 'crypto-js'
export function encryptRsa(data) {
    // 新建JSEncrypt对象
    const encryptor = new JSEncrypt(undefined)
    // 设置公钥
    const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDFhxWzzZsrvcUvhx0K/0hlp9FgbDUHy+Jo6EkdTU8zmm+1luaKZa+mVbTn9ywNu+gI9eaQjfjmoIuQ+SrzShmDEyLV8x69jUTttJcnyQ2KRum/ONTomOcOkXejbs0GA3vIe6D4MC3726NR4fdE0P0eSuHNoHk37k1r6H//OFdmRwIDAQAB'
    encryptor.setPublicKey(publicKey)
    // 加密数据
    return encryptor.encrypt(data)
}

const AES_KEY = "0123456789ABHAEQ";


export const encryptAes =(word) =>{
        const key = cryptoJs.enc.Utf8.parse(AES_KEY);
        const srcs = cryptoJs.enc.Utf8.parse(word);
        const encrypted = cryptoJs.AES.encrypt(srcs, key, {mode: cryptoJs.mode.ECB, padding: cryptoJs.pad.Pkcs7});
        return encrypted.toString();
}
export const decryptAes =(word)=> {
    const key = cryptoJs.enc.Utf8.parse(AES_KEY);
    const decrypt = cryptoJs.AES.decrypt(word, key, {mode: cryptoJs.mode.ECB, padding: cryptoJs.pad.Pkcs7});
    return cryptoJs.enc.Utf8.stringify(decrypt).toString();
}


