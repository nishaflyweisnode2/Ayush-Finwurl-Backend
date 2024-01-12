function decryption(referral_email) {
    // Create an empty array to store the encrypted characters
    const decryptedEmail = [];

    for (let i = 0; i < referral_email.length; i++) {
        // Subtract 17 from the ASCII code of each character and store the result
        const decryptedChar = String.fromCharCode(referral_email.charCodeAt(i) - 2);
        decryptedEmail.push(decryptedChar);
    }

    // Join the encrypted characters to form the encrypted string
    return decryptedEmail.join('');
}

// console.log(decryption("cdefghijklmnopqrstuvwxyz{|3456789:;2B0"))
module.exports = decryption