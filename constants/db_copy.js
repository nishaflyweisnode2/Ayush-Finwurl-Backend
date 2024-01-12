// // const { MongoClient } = require('mongodb');
// // const cron = require('node-cron');
// // const fs = require('fs');
// // const path = require('path');
// // const moment = require('moment');

// // // MongoDB Atlas connection URI
// // const uri = "mongodb+srv://shashankgupta9248:Shashank10@finurl-db.0o2q15m.mongodb.net/test"

// // // Directory to store backups
// // const backupDir = './backups';

// // // MongoDB client
// // const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// // async function backupCollections() {
// //   try {
// //     await client.connect();

// //     const db = client.db(); // Use your database name

// //     // Get a list of all collections in your database
// //     const collections = await db.listCollections().toArray();

// //     // Create a backup directory if it doesn't exist
// //     if (!fs.existsSync(backupDir)) {
// //       fs.mkdirSync(backupDir);
// //     }

// //     // Timestamp for the backup file
// //     const timestamp = moment().format('YYYYMMDDHHmmss');
    
// //     for (const collection of collections) {
// //       // Dump each collection to a separate JSON file
// //       const collectionName = collection.name;
// //       const data = await db.collection(collectionName).find().toArray();
// //       const backupFileName = path.join(backupDir, `${collectionName}_${timestamp}.json`);

// //       fs.writeFileSync(backupFileName, JSON.stringify(data, null, 2));
// //       console.log(`Backup created for collection: ${collectionName}`);
// //     }
// //   } catch (error) {
// //     console.error('Error during backup:', error);
// //   } finally {
// //     client.close();
// //   }
// // }

// // // Schedule the backup every 12 hours (adjust the cron schedule as needed)
// // cron.schedule('0 */12 * * *', () => {
// //   console.log('Running backup...');
// //   backupCollections();

// // });

// // // Initial backup to run on script start
// // backupCollections();

// const mongoose = require('mongoose');
// const cron = require('node-cron');
// const fs = require('fs');
// const path = require('path');
// const moment = require('moment');
// const nodegit = require('nodegit');
// const Octokit = require('@octokit/rest');

// // GitHub credentials
// const GITHUB_TOKEN = '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';
// const GITHUB_REPO_OWNER = 'RohitDSawant';
// const GITHUB_REPO_NAME = 'khajina';

// // MongoDB Atlas connection URI
// const MONGODB_URI = 'mongodb+srv://shashankgupta9248:Shashank10@finurl-db.0o2q15m.mongodb.net/test';

// // Mongoose connection
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// // Create a Mongoose model for your collections
// // const YourModel = mongoose.model('YourModel', new mongoose.Schema({}));

// // Directory to store backups
// const backupDir = './backups';

// async function backupCollections() {
//   try {
//     // Get a list of all collections in your database
//     const collections = await mongoose.connection.db.listCollections().toArray();

//     // Create a backup directory if it doesn't exist
//     if (!fs.existsSync(backupDir)) {
//       fs.mkdirSync(backupDir);
//     }

//     // Timestamp for the backup file
//     const timestamp = moment().format('YYYYMMDDHHmmss');
    
//     for (const collection of collections) {
//       const collectionName = collection.name;
      
//       // Dump each collection to a separate JSON file
//       const data = await YourModel.find().lean();
//       const backupFileName = path.join(backupDir, `${collectionName}_${timestamp}.json`);

//       fs.writeFileSync(backupFileName, JSON.stringify(data, null, 2));
//       console.log(`Backup created for collection: ${collectionName}`);
//     }

//     // Initialize a Git repository in the backup directory
//     const repo = await nodegit.Repository.init(backupDir, 0);
    
//     // Commit the changes
//     const signature = nodegit.Signature.now('Rohit Sawant', 'rohits1547@gmail.com');
//     const index = await repo.refreshIndex();
//     await index.addAll();
//     await index.write();
//     const oid = await index.writeTree();
//     const head = await nodegit.Reference.nameToId(repo, 'HEAD');
//     const parent = await repo.getCommit(head);
//     await repo.createCommit('HEAD', signature, signature, 'Backup', oid, [parent]);

//     // Push to GitHub
//     await pushToGitHub(GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_TOKEN, backupDir);
//   } catch (error) {
//     console.error('Error during backup:', error);
//   }
// }

// // Schedule the backup every 12 hours (adjust the cron schedule as needed)
// cron.schedule('0 */12 * * *', () => {
//   console.log('Running backup...');
//   backupCollections();
// });

// // Initial backup to run on script start
// backupCollections();

// // Function to push to GitHub
// async function pushToGitHub(owner, repo, token, localDir) {
//   try {
//     const octokit = new Octokit({ auth: token });
//     const remote = await octokit.repos.get({ owner, repo });
    
//     const remoteUrl = remote.data.ssh_url;
//     const repo = await nodegit.Repository.open(localDir);
//     const remoteRepo = await repo.getRemote('origin');
    
//     const refSpecs = [`+refs/heads/*:refs/remotes/origin/*`];
//     await remoteRepo.push(refSpecs, { callbacks: { credentials: () => nodegit.Cred.sshKeyFromAgent('your-ssh-key') } });
    
//     console.log('Pushed to GitHub successfully.');
//   } catch (error) {
//     console.error('Error pushing to GitHub:', error);
//   }
// }
