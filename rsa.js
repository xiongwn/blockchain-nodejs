  function encrypt(data, keyJSON){
                var data = new TextEncoder("UTF-8").encode(data);
                var randomsKeys = geneRandomHexStr(64); // 128 bit keys
                var encryptedKey = hexStringToUint8Array(randomsKeys);
                var aesAlgo = {name: 'aes-cbc', iv: hexStringToUint8Array("000102030405060708090a0b0c0d0e0f")};
                return crypto.subtle.importKey("jwk", keyJSON, {name: "rsa-oaep", hash: {name: "sha-256"}},true, ['encrypt'])
                    .then(function(publicKey){
                        return crypto.subtle.encrypt({name: "rsa-oaep"}, publicKey, encryptedKey);
                    }).then(function(res){
                        encryptedKey = bytesToHexString(res)
                        // use aes to encrypt data
                        // import aes key
                        return crypto.subtle.importKey('raw', 
                            hexStringToUint8Array(randomsKeys) , aesAlgo, false, ['encrypt', 'decrypt']);
                         
                    }).then(function(result){
                        // use aes to encode
                        return crypto.subtle.encrypt(aesAlgo,
                         result, data);
                    }).then(function(encryptedData){
                        return Promise.resolve({
                            'encrypted': bytesToHexString(encryptedData),
                            'encryptedKey': encryptedKey,
                        });
                    });
 
                //console.log(new TextDecoder("UTF-8").decode(data));
                // use server public key to encrypt
                 
            }
 
            function decrypt(data, keyJSON){
                // use local private key to decrypt
                var encryptedKey = new hexStringToUint8Array(data.encryptedKey);
                var encryptedData = new hexStringToUint8Array(data.encrypted);
                var aesAlgo = {name: 'aes-cbc', iv: hexStringToUint8Array("000102030405060708090a0b0c0d0e0f")};
                // decrypt key
                return crypto.subtle.importKey('jwk', keyJSON, {name: "rsa-oaep", hash: {name: "sha-256"}}, true,
                    ['decrypt']).then(function(privateKey){
                        return crypto.subtle.decrypt({name: 'rsa-oaep'}, privateKey, encryptedKey);
                    }).then(function(decryptedKey){
                        // import aes key
                        return crypto.subtle.importKey('raw', 
                            decryptedKey, aesAlgo, false, ['encrypt', 'decrypt']);
                    }).catch(function(){
                        console.error("decrypt error");
                    }).then(function(result){
                        // decode encrypted data
                        return crypto.subtle.decrypt(aesAlgo, result, encryptedData);
                    }).then(function(data){
                        return Promise.resolve(new TextDecoder("UTF-8").decode(new Uint8Array(data)));
                    })
 
            }
 
            function createNewUserKey(){
                var algorithmKeyGen = {
                    name: "RSA-OAEP",
                    hash: {name: "sha-256"},
                    // RsaKeyGenParams
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),  // Equivalent to 65537
                };
                var nonExtractable = false;
                 
                var publicKey = "";
                var privateKey = "";
                var keyPairs = "";
                return crypto.subtle.generateKey(algorithmKeyGen, true, ['encrypt', 'decrypt']).then(function(result) {
                    // gene key pair
                    keyPairs = result;
                    return Promise.all([crypto.subtle.exportKey("jwk", keyPairs.publicKey),
                        crypto.subtle.exportKey("jwk", keyPairs.privateKey)]);
                })
                 
            }
 
            function _arrayBufferToBase64( buffer ) {
                var binary = '';
                var bytes = new Uint8Array( buffer );
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode( bytes[ i ] );
                }
                return window.btoa( binary );
            }
 
            function hexStringToUint8Array(hexString) {
                if (hexString.length % 2 != 0)
                    throw "Invalid hexString";
                var arrayBuffer = new Uint8Array(hexString.length / 2);
                for (var i = 0; i < hexString.length; i += 2) {
                    var byteValue = parseInt(hexString.substr(i, 2), 16);
                    if (byteValue == NaN)
                        throw "Invalid hexString";
                    arrayBuffer[i/2] = byteValue;
                }
                return arrayBuffer;
            }
 
            function bytesToHexString(bytes) {
                if (!bytes)
                    return null;
                bytes = new Uint8Array(bytes);
                var hexBytes = [];
                for (var i = 0; i < bytes.length; ++i) {
                    var byteString = bytes[i].toString(16);
                    if (byteString.length < 2)
                        byteString = "0" + byteString;
                    hexBytes.push(byteString);
                }
                return hexBytes.join("");
            }
 
            function geneRandomHexStr(length){
                var text = "";
                var possible = "0123456789abcdef";
 
                for( var i=0; i < length; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
 
                return text;
            }
 
            createNewUserKey().then(function(keyPairs){
                encrypt("this is origin text", keyPairs[0]).then(function(res){
                    console.log('public', JSON.stringify(keyPairs[0]));
                    console.log('private', JSON.stringify(keyPairs[1]));
                    decrypt(res, keyPairs[1]).then(function(decrypted){
                        console.log('decrypted', decrypted);
                    });
                });
            })