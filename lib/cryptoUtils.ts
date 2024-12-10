// cryptoUtils.ts

// Utility function to generate a cryptographic key
export const generateKey = async (key: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
  
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  };
  
  // Function to encrypt text
  export const encrypt = async (text: string, password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const key = await generateKey(password);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );
  
    const encryptedContentArray = new Uint8Array(encryptedContent);
    const resultArray = new Uint8Array(iv.length + encryptedContentArray.length);
    resultArray.set(iv, 0);
    resultArray.set(encryptedContentArray, iv.length);
  
    return btoa(
      String.fromCharCode(...Array.from(resultArray))
    );
  };
  
  // Function to decrypt text
  export const decrypt = async (encryptedText: string, password: string): Promise<string> => {
    const encryptedData = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0));
    const iv = encryptedData.slice(0, 12);
    const data = encryptedData.slice(12);
  
    const key = await generateKey(password);
  
    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );
  
    const decoder = new TextDecoder();
    return decoder.decode(decryptedContent);
  };

  export const handleOperation = async (
    operation: "encrypt" | "decrypt",
    text: string,
    key: string
  ) => {
    try {
      if (!text || !key) return;
      let operationResult: string;

      if (operation === "encrypt") {
        operationResult = await encrypt(text, key);
      } else {
        operationResult = await decrypt(text, key);
      }

      return operationResult;
    } catch (error) {
      console.log(error);
      return "";
    }
  };
  