"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = handler;

var _db = require("../utils/db");

var _mongoose = _interopRequireDefault(require("mongoose"));

var _ably = require("../utils/ably");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Corrected path
// Corrected path
// Define the schema for the post
var postSchema = new _mongoose["default"].Schema({
  message: String,
  timestamp: Date,
  username: String,
  sessionId: String,
  likes: {
    type: Number,
    "default": 0
  },
  dislikes: {
    type: Number,
    "default": 0
  },
  likedBy: [String],
  // Store usernames or user IDs of users who liked the post
  dislikedBy: [String],
  // Store usernames or user IDs of users who disliked the post
  comments: [{
    username: String,
    comment: String,
    timestamp: Date
  }]
});

var Post = _mongoose["default"].model('Post', postSchema); // Set CORS headers


var setCorsHeaders = function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins or set a specific domain

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS'); // Allowed methods

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers
}; // Serverless API handler for creating/editing posts


function handler(req, res) {
  var _req$body, message, username, sessionId, newPost, cleanPost, _req$body2, postId, _message, likes, dislikes, comments, post, updatedPost;

  return regeneratorRuntime.async(function handler$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(req.method === 'OPTIONS')) {
            _context.next = 3;
            break;
          }

          setCorsHeaders(res);
          return _context.abrupt("return", res.status(200).end());

        case 3:
          // Set CORS headers before processing the request
          setCorsHeaders(res);

          if (!(req.method === 'POST')) {
            _context.next = 38;
            break;
          }

          // Handle new post creation
          _req$body = req.body, message = _req$body.message, username = _req$body.username, sessionId = _req$body.sessionId;

          if (!(!message || message.trim() === '')) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'Message cannot be empty'
          }));

        case 8:
          if (!(!username || !sessionId)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'Username and sessionId are required'
          }));

        case 10:
          _context.prev = 10;
          console.log('Connecting to database...');
          _context.next = 14;
          return regeneratorRuntime.awrap((0, _db.connectToDatabase)());

        case 14:
          // Ensure this step completes
          console.log('Database connected successfully.');
          newPost = new Post({
            message: message,
            timestamp: new Date(),
            username: username,
            sessionId: sessionId
          });
          _context.next = 18;
          return regeneratorRuntime.awrap(newPost.save());

        case 18:
          console.log('New post saved:', newPost); // Publish to Ably

          _context.prev = 19;
          _context.next = 22;
          return regeneratorRuntime.awrap((0, _ably.publishToAbly)('newOpinion', newPost));

        case 22:
          console.log('Post published to Ably:', newPost);
          _context.next = 28;
          break;

        case 25:
          _context.prev = 25;
          _context.t0 = _context["catch"](19);
          console.error('Error publishing to Ably:', _context.t0);

        case 28:
          // Send only the necessary data (not the full Mongoose document)
          cleanPost = {
            _id: newPost._id,
            message: newPost.message,
            timestamp: newPost.timestamp,
            username: newPost.username,
            likes: newPost.likes,
            dislikes: newPost.dislikes,
            comments: newPost.comments
          };
          res.status(201).json(cleanPost); // Send clean post data without Mongoose metadata

          _context.next = 36;
          break;

        case 32:
          _context.prev = 32;
          _context.t1 = _context["catch"](10);
          console.error('Error saving post:', _context.t1);
          res.status(500).json({
            message: 'Error saving post',
            error: _context.t1
          });

        case 36:
          _context.next = 79;
          break;

        case 38:
          if (!(req.method === 'PUT' || req.method === 'PATCH')) {
            _context.next = 78;
            break;
          }

          // Handle post edit
          _req$body2 = req.body, postId = _req$body2.postId, _message = _req$body2.message, likes = _req$body2.likes, dislikes = _req$body2.dislikes, comments = _req$body2.comments;

          if (postId) {
            _context.next = 42;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'Post ID is required'
          }));

        case 42:
          _context.prev = 42;
          console.log('Connecting to database...');
          _context.next = 46;
          return regeneratorRuntime.awrap((0, _db.connectToDatabase)());

        case 46:
          console.log('Database connected successfully.');
          _context.next = 49;
          return regeneratorRuntime.awrap(Post.findById(postId));

        case 49:
          post = _context.sent;

          if (post) {
            _context.next = 52;
            break;
          }

          return _context.abrupt("return", res.status(404).json({
            message: 'Post not found'
          }));

        case 52:
          // Update the fields (message, likes, dislikes, comments)
          if (_message && _message.trim() !== '') {
            post.message = _message;
          }

          if (likes !== undefined) {
            post.likes = likes;
          }

          if (dislikes !== undefined) {
            post.dislikes = dislikes;
          }

          if (comments !== undefined) {
            post.comments = comments;
          } // Save the updated post


          _context.next = 58;
          return regeneratorRuntime.awrap(post.save());

        case 58:
          console.log('Post updated:', post); // Publish to Ably

          _context.prev = 59;
          _context.next = 62;
          return regeneratorRuntime.awrap((0, _ably.publishToAbly)('editOpinion', post));

        case 62:
          console.log('Post updated in Ably:', post);
          _context.next = 68;
          break;

        case 65:
          _context.prev = 65;
          _context.t2 = _context["catch"](59);
          console.error('Error publishing to Ably:', _context.t2);

        case 68:
          // Send only the necessary data (not the full Mongoose document)
          updatedPost = {
            _id: post._id,
            message: post.message,
            timestamp: post.timestamp,
            username: post.username,
            likes: post.likes,
            dislikes: post.dislikes,
            comments: post.comments
          };
          res.status(200).json(updatedPost); // Send updated post data

          _context.next = 76;
          break;

        case 72:
          _context.prev = 72;
          _context.t3 = _context["catch"](42);
          console.error('Error editing post:', _context.t3);
          res.status(500).json({
            message: 'Error editing post',
            error: _context.t3
          });

        case 76:
          _context.next = 79;
          break;

        case 78:
          res.status(405).json({
            message: 'Method Not Allowed'
          });

        case 79:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[10, 32], [19, 25], [42, 72], [59, 65]]);
}
//# sourceMappingURL=postOpinion.dev.js.map
