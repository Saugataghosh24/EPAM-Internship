const mongoose = require("mongoose");
const busboy = require("busboy"); // Import correctly
const { PassThrough } = require("stream");
// const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const User = require("../models/User");

// Load environment variables
dotenv.config();

const REGION = process.env.AWS_REGION || "eu-west-1";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "tm1-files-bucket-team1-dev1";
const s3Client = new S3Client({ region: REGION });

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // For CORS support
    "Access-Control-Allow-Credentials": true
  },
  body: JSON.stringify(body),
});

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let fileBuffer = null;
    let fileMimeType = "";
    let fileName = "";
    let hasFile = false;

    // Handle different casing in headers
    const contentType = event.headers['Content-Type'] || 
                       event.headers['content-type'] || 
                       event.multiValueHeaders?.['content-type']?.[0];

    if (!contentType || !contentType.includes('multipart/form-data')) {
      return reject(new Error('Invalid or missing Content-Type. Expected multipart/form-data'));
    }

    // Create busboy instance with the updated API
    const busboyInstance = busboy({ 
      headers: { 'content-type': contentType },
      limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    });

    busboyInstance.on("file", (fieldname, file, fileInfo) => {
      const { filename, encoding, mimeType } = fileInfo;
      
      if (fieldname === 'avatar' && filename) {
        hasFile = true;
        fileMimeType = mimeType;
        fileName = filename;
        const chunks = [];
        
        file.on("data", (data) => {
          chunks.push(data);
        });
        
        file.on("end", () => {
          if (chunks.length > 0) {
            fileBuffer = Buffer.concat(chunks);
          }
        });
      } else {
        // Skip other files or empty file inputs
        file.resume();
      }
    });

    busboyInstance.on("field", (fieldname, value) => {
      fields[fieldname] = value;
    });

    busboyInstance.on("finish", () => {
      resolve({ 
        fields, 
        fileBuffer, 
        fileMimeType, 
        fileName,
        hasFile 
      });
    });

    busboyInstance.on("error", (err) => {
      console.error("Busboy error:", err);
      reject(err);
    });

    // Handle base64 encoded body if necessary
    const bodyBuffer = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64') 
      : Buffer.from(event.body);
    
    const stream = new PassThrough();
    stream.end(bodyBuffer);
    stream.pipe(busboyInstance);
  });
}

async function uploadToS3(buffer, userId, mimeType) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty file buffer");
  }

  // Determine file extension based on mime type
  let extension = "png";
  if (mimeType) {
    const match = mimeType.match(/\/([a-zA-Z0-9]+)$/);
    if (match && match[1]) {
      extension = match[1].toLowerCase();
      // Handle jpeg special case
      if (extension === 'jpeg') extension = 'jpg';
    }
  }

  const key = `files/images/users/${userId}_${Date.now()}.${extension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: "public-read",
    });

    await s3Client.send(command);
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

const updatePersonalInfoHandler = async (event) => {
  try {
    console.log("Event received:", JSON.stringify(event));
    
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const { id } = event?.pathParameters || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return response(400, { message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return response(404, { message: "User not found" });
    }

    // Parse the multipart form data
    let parsedData;
    try {
      parsedData = await parseMultipart(event);
      console.log("Form data parsed successfully:", JSON.stringify({
        fieldNames: Object.keys(parsedData.fields),
        hasFile: parsedData.hasFile,
        fileName: parsedData.fileName
      }));
    } catch (parseError) {
      console.error("Failed to parse multipart data:", parseError);
      return response(400, { message: `Failed to parse form data: ${parseError.message}` });
    }
    
    const { fields, fileBuffer, fileMimeType, hasFile } = parsedData;

    // Prepare update data
    const updateData = {};
    
    // Update basic fields if provided
    if (fields.firstName) updateData.firstName = fields.firstName;
    if (fields.lastName) updateData.lastName = fields.lastName;
    if (fields.phoneNumber) updateData.phoneNo = fields.phoneNumber;
    
    // Update address fields
    const addressUpdates = {};
    if (fields.street) addressUpdates.street = fields.street;
    if (fields.city) addressUpdates.city = fields.city;
    if (fields.country) addressUpdates.country = fields.country;
    if (fields.postalCode) addressUpdates.postalCode = fields.postalCode;
    
    if (Object.keys(addressUpdates).length > 0) {
      updateData['address'] = {
        ...(user.address || {}),  // Keep existing address fields
        ...addressUpdates // Override with new values
      };
    }

    // Upload image if provided
    if (hasFile && fileBuffer) {
      try {
        console.log("Uploading image to S3...");
        const imageUrl = await uploadToS3(fileBuffer, id, fileMimeType);
        updateData.imageUrl = imageUrl;
        console.log("Image uploaded successfully:", imageUrl);
      } catch (uploadError) {
        console.error("Failed to upload image:", uploadError);
        // Continue with the update even if image upload fails
      }
    }

    // Only proceed with update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return response(400, { message: "No valid fields to update" });
    }

    console.log("Updating user with data:", JSON.stringify(updateData));
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return response(404, { message: "User not found or update failed" });
    }

    // Format the response according to the API spec
    return response(200, {
      clientId: updatedUser._id.toString(),
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phoneNumber: updatedUser.phoneNo,
      imageUrl: updatedUser.imageUrl || null,
      street: updatedUser.address?.street || "",
      city: updatedUser.address?.city || "",
      country: updatedUser.address?.country || "",
      postalCode: updatedUser.address?.postalCode || ""
    });

  } catch (err) {
    console.error("Error updating personal info:", err);
    return response(500, { message: `Internal server error: ${err.message}` });
  }
};

// Export using CommonJS
module.exports = { updatePersonalInfoHandler };