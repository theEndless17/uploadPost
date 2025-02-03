import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db';  // Your connection utility

// Define the schema for the post
const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [String],  // Store usernames or user IDs of users who liked the post
    dislikedBy: [String],  // Store usernames or user IDs of users who disliked the post
    comments: [{ username: String, comment: String, timestamp: Date }]
});

// Create the model for posts
const Post = mongoose.model('Post', postSchema);

// Set CORS headers
const setCorsHeaders = (response) => {
    response.headers.set('Access-Control-Allow-Origin', '*');  // Allow all origins
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');  // Allow specific methods
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');  // Allow specific headers
};

// Serverless API handler for getting posts (Cloudflare Pages specific)
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
            await connectToDatabase();  // Connect to MongoDB

            // Fetch posts from the database, sorted by the timestamp in descending order
            const posts = await Post.find().sort({ timestamp: -1 });

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
