import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db';  // Your connection utility
import { publishToAbly } from '../utils/ably';  // Your Ably publish utility

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
const Post = mongoose.model('Post', postSchema);

// Set CORS headers
const setCorsHeaders = (response) => {
    response.headers.set('Access-Control-Allow-Origin', '*');  // Allow all origins or specify your domain
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS');  // Allowed methods
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');  // Allowed headers
};

// Cloudflare Pages serverless function handler (onRequest)
export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    let response = new Response(null, {
        headers: { 'Content-Type': 'application/json' },
    });

    // Set CORS headers for all requests
    setCorsHeaders(response);

    // Handle pre-flight OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: response.headers });
    }

    // Handle POST and PUT/PATCH requests to create and update posts
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        const body = await request.json();
        const { postId, message, username, sessionId, likes, dislikes, comments } = body;

        if (request.method === 'POST') {
            // Handle new post creation
            if (!message || message.trim() === '') {
                return new Response(JSON.stringify({ message: 'Message cannot be empty' }), {
                    status: 400,
                    headers: response.headers,
                });
            }
            if (!username || !sessionId) {
                return new Response(JSON.stringify({ message: 'Username and sessionId are required' }), {
                    status: 400,
                    headers: response.headers,
                });
            }

            try {
                console.log('Connecting to database...');
                await connectToDatabase();  // Ensure DB connection
                console.log('Database connected successfully.');

                const newPost = new Post({ message, timestamp: new Date(), username, sessionId });
                await newPost.save();

                console.log('New post saved:', newPost);

                // Publish to Ably
                try {
                    await publishToAbly('newOpinion', newPost);
                    console.log('Post published to Ably:', newPost);
                } catch (error) {
                    console.error('Error publishing to Ably:', error);
                }

                // Send clean post data (no mongoose metadata)
                const cleanPost = {
                    _id: newPost._id,
                    message: newPost.message,
                    timestamp: newPost.timestamp,
                    username: newPost.username,
                    likes: newPost.likes,
                    dislikes: newPost.dislikes,
                    comments: newPost.comments,
                };

                response = new Response(JSON.stringify(cleanPost), {
                    status: 201,
                    headers: response.headers,
                });
                return response;
            } catch (error) {
                console.error('Error saving post:', error);
                return new Response(JSON.stringify({ message: 'Error saving post', error }), {
                    status: 500,
                    headers: response.headers,
                });
            }
        }

        if (request.method === 'PUT' || request.method === 'PATCH') {
            // Handle post editing
            if (!postId) {
                return new Response(JSON.stringify({ message: 'Post ID is required' }), {
                    status: 400,
                    headers: response.headers,
                });
            }

            try {
                console.log('Connecting to database...');
                await connectToDatabase();  // Ensure DB connection
                console.log('Database connected successfully.');

                const post = await Post.findById(postId);
                if (!post) {
                    return new Response(JSON.stringify({ message: 'Post not found' }), {
                        status: 404,
                        headers: response.headers,
                    });
                }

                // Update the fields (message, likes, dislikes, comments)
                if (message && message.trim() !== '') {
                    post.message = message;
                }
                if (likes !== undefined) {
                    post.likes = likes;
                }
                if (dislikes !== undefined) {
                    post.dislikes = dislikes;
                }
                if (comments !== undefined) {
                    post.comments = comments;
                }

                // Save the updated post
                await post.save();

                console.log('Post updated:', post);

                // Publish to Ably
                try {
                    await publishToAbly('editOpinion', post);
                    console.log('Post updated in Ably:', post);
                } catch (error) {
                    console.error('Error publishing to Ably:', error);
                }

                // Send updated post data
                const updatedPost = {
                    _id: post._id,
                    message: post.message,
                    timestamp: post.timestamp,
                    username: post.username,
                    likes: post.likes,
                    dislikes: post.dislikes,
                    comments: post.comments,
                };

                response = new Response(JSON.stringify(updatedPost), {
                    status: 200,
                    headers: response.headers,
                });
                return response;

            } catch (error) {
                console.error('Error editing post:', error);
                return new Response(JSON.stringify({ message: 'Error editing post', error }), {
                    status: 500,
                    headers: response.headers,
                });
            }
        }
    } else {
        // If the request is not POST, PUT, or PATCH, respond with Method Not Allowed
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
            status: 405,
            headers: response.headers,
        });
    }
}
