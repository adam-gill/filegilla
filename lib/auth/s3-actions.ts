// // In a file like `app/lib/s3-actions.ts`

// "use server";

// import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// // --- ENVIRONMENT VARIABLES ---
// // These must be set in your .env.local file.
// // The AWS SDK will automatically use AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
// // for the initial authentication of your application's IAM User.
// const S3_ACCESS_ROLE_ARN = process.env.S3_ACCESS_ROLE_ARN;
// const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
// const AWS_REGION = process.env.AWS_REGION;

// /**
//  * Creates a user-specific folder in S3 upon account creation.
//  * This is achieved by creating a zero-byte object with a key that ends in a slash.
//  * This function must be called from a secure, server-only environment.
//  *
//  * @param userId - The unique ID for the user from your authentication system.
//  * @returns An object indicating success or failure, with an optional error message.
//  */
// export async function createUserFolder(
//   userId: string
// ): Promise<{ success: boolean; error?: string }> {
//   // Basic validation
//   if (!userId) {
//     return { success: false, error: "User ID is required to create a folder." };
//   }

//   if (!S3_ACCESS_ROLE_ARN || !S3_BUCKET_NAME || !AWS_REGION) {
//     console.error("Missing required S3 environment variables.");
//     return { success: false, error: "Server configuration error." };
//   }

//   try {
//     // 1. Assume the specific IAM Role designated for S3 user actions.
//     // We tag the session with the user's ID, which enforces the IAM policy
//     // and restricts access to only this user's folder.
//     const stsClient = new STSClient({ region: AWS_REGION });
//     const assumeRoleCommand = new AssumeRoleCommand({
//       RoleArn: S3_ACCESS_ROLE_ARN,
//       RoleSessionName: `s3-folder-creation-${userId}`, // A unique name for the session
//       Tags: [{ Key: "userId", Value: userId }],
//       DurationSeconds: 900, // 15 minutes is plenty of time for this operation
//     });

//     const assumedRole = await stsClient.send(assumeRoleCommand);

//     // Ensure credentials were received
//     if (!assumedRole.Credentials) {
//       throw new Error("Failed to assume role, no credentials received.");
//     }

//     // 2. Create a temporary, short-lived S3 client using the credentials
//     // from the assumed role. This client has the restricted permissions.
//     const s3Client = new S3Client({
//       region: AWS_REGION,
//       credentials: {
//         accessKeyId: assumedRole.Credentials.AccessKeyId!,
//         secretAccessKey: assumedRole.Credentials.SecretAccessKey!,
//         sessionToken: assumedRole.Credentials.SessionToken!,
//       },
//     });

//     // 3. Create the "folder" by sending a PutObject command for a zero-byte object
//     // with a key that ends in a forward slash.
//     const putObjectCommand = new PutObjectCommand({
//       Bucket: S3_BUCKET_NAME,
//       Key: `private/${userId}/`,
//       Body: "", // An empty body creates the folder object
//     });

//     await s3Client.send(putObjectCommand);

//     console.log(`Successfully created folder for user: ${userId}`);
//     return { success: true };

//   } catch (error) {
//     console.error(`Error creating S3 folder for user ${userId}:`, error);
//     // Avoid leaking detailed error information to the client
//     return { success: false, error: "Could not create user storage folder." };
//   }
// }
