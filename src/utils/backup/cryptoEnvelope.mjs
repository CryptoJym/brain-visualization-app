// Versioned local-file encryption using the browser's standard Web Crypto implementation.
export const BACKUP_EXTENSION='.cortex';
export const BACKUP_ITERATIONS=600000;
export const MAX_BACKUP_BYTES=12*1024*1024;
const MAGIC=new TextEncoder().encode('CCBKUP01'),HEADER_BYTES=36;
const subtle=()=>{if(!globalThis.crypto?.subtle)throw new Error('Encrypted backups require a secure browser connection.');return crypto.subtle;};
export function validateBackupPassword(password){
 if(typeof password!=='string'||password.length<12||password.length>256)throw new Error('Use a backup password of 12–256 characters. Several unrelated words are a good choice.');
 return password;
}
async function derive(password,salt,usage){
 const api=subtle(),material=await api.importKey('raw',new TextEncoder().encode(validateBackupPassword(password)),{name:'PBKDF2'},false,['deriveKey']);
 return api.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:BACKUP_ITERATIONS},material,{name:'AES-GCM',length:256},false,[usage]);
}
export async function encryptBackup(payload,password){
 validateBackupPassword(password);const raw=new TextEncoder().encode(JSON.stringify(payload));
 if(raw.byteLength>MAX_BACKUP_BYTES-HEADER_BYTES-16)throw new Error('The backup is too large. The existing profile has not been changed.');
 const header=new Uint8Array(HEADER_BYTES);header.set(MAGIC);crypto.getRandomValues(header.subarray(8,24));crypto.getRandomValues(header.subarray(24,36));
 const key=await derive(password,header.subarray(8,24),'encrypt');
 const ciphertext=new Uint8Array(await subtle().encrypt({name:'AES-GCM',iv:header.subarray(24),additionalData:header,tagLength:128},key,raw));
 const file=new Uint8Array(header.length+ciphertext.length);file.set(header);file.set(ciphertext,header.length);return file;
}
export async function decryptBackup(input,password){
 validateBackupPassword(password);const bytes=input instanceof Uint8Array?input:input instanceof ArrayBuffer?new Uint8Array(input):null;
 if(!bytes||bytes.byteLength<HEADER_BYTES+16||bytes.byteLength>MAX_BACKUP_BYTES)throw new Error('Choose a valid Cortex backup under 12 MB.');
 if(!MAGIC.every((v,i)=>bytes[i]===v))throw new Error('This is not a supported .cortex backup. The saved profile has not been changed.');
 const header=bytes.slice(0,HEADER_BYTES),key=await derive(password,header.subarray(8,24),'decrypt');let plaintext;
 try{plaintext=await subtle().decrypt({name:'AES-GCM',iv:header.subarray(24),additionalData:header,tagLength:128},key,bytes.subarray(HEADER_BYTES));}catch{throw new Error('The password is incorrect or this backup was changed or damaged. Nothing has been restored.');}
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(plaintext));}catch{throw new Error('The decrypted backup is not readable. Nothing has been restored.');}
}
