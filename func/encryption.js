function encryption(referral_email) {
    // Create an empty array to store the encrypted characters
    const encryptedEmail = [];

    for (let i = 0; i < referral_email.length; i++) {
        // Subtract 17 from the ASCII code of each character and store the result
        const encryptedChar = String.fromCharCode(referral_email.charCodeAt(i) + 2);
        encryptedEmail.push(encryptedChar);
    }

    // Join the encrypted characters to form the encrypted string
    return encryptedEmail.join('');
}

// console.log(encryption("cdefghijklmnopqrstuvwxyz{|3456789:;2B0"))
module.exports = encryption
 
