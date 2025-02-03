// Import the MongoDB native driver
import { MongoClient } from 'mongodb';

// MongoDB URI and Database
const MONGO_URI = process.env.MONGO_URI; // Make sure to set this in your environment variables
const DB_NAME = 'chatApp'; // Replace with your database name
let client;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  const db = client.db(DB_NAME);
  return db.collection('posts'); // Replace 'posts' with your collection name
}

// Set CORS headers
const setCorsHeaders = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS'); // Allowed methods
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers
};

// Serverless function handler
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Set CORS headers for every request
  let response = new Response(null, {
    headers: { 'Content-Type': 'application/json' },
  });
  setCorsHeaders(response);

  // Handle pre-flight OPTIONS request (CORS pre-flight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers });
  }

  // Handle GET request to fetch posts
  if (request.method === 'GET') {
    try {
      const postsCollection = await connectToDatabase(); // Connect to MongoDB
      const posts = await postsCollection.find().sort({ timestamp: -1 }).toArray(); // Fetch posts

      // Return the posts as a JSON response
      response = new Response(JSON.stringify(posts), {
        status: 200,
        headers: response.headers,
      });
      return response;

    } catch (error) {
      console.error("Error retrieving posts:", error);
      return new Response(
        JSON.stringify({ message: 'Error retrieving posts', error }),
        { status: 500, headers: response.headers }
      );
    }
  } else {
    // If the request is not GET, respond with Method Not Allowed
    return new Response(
      JSON.stringify({ message: 'Method Not Allowed' }),
      { status: 405, headers: response.headers }
    );
  }
}

