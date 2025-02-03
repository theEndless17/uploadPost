"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = handler;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _db = require("../utils/db");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Your connection utility
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
}); // Create the model for posts

var Post = _mongoose["default"].model('Post', postSchema); // Set CORS headers


var setCorsHeaders = function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins or specify your domain

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS'); // Allowed methods

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers
}; // Serverless API handler for liking, disliking, or commenting on a post


function handler(req, res) {
  var _req$body, postId, username, action, comment, post;

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
          // Set CORS headers for all other requests
          setCorsHeaders(res);
          _req$body = req.body, postId = _req$body.postId, username = _req$body.username, action = _req$body.action, comment = _req$body.comment;
          _context.prev = 5;
          _context.next = 8;
          return regeneratorRuntime.awrap((0, _db.connectToDatabase)());

        case 8:
          if (!(req.method === 'POST')) {
            _context.next = 44;
            break;
          }

          _context.next = 11;
          return regeneratorRuntime.awrap(Post.findById(postId));

        case 11:
          post = _context.sent;

          if (post) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", res.status(404).json({
            message: 'Post not found'
          }));

        case 14:
          if (!(action === 'like')) {
            _context.next = 23;
            break;
          }

          if (!post.dislikedBy.includes(username)) {
            _context.next = 17;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'You cannot like a post you have disliked'
          }));

        case 17:
          if (!post.likedBy.includes(username)) {
            _context.next = 19;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'You have already liked this post'
          }));

        case 19:
          post.likes += 1;
          post.likedBy.push(username); // Add the user to the likedBy array
          // Handle the "dislike" action

          _context.next = 39;
          break;

        case 23:
          if (!(action === 'dislike')) {
            _context.next = 32;
            break;
          }

          if (!post.likedBy.includes(username)) {
            _context.next = 26;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'You cannot dislike a post you have liked'
          }));

        case 26:
          if (!post.dislikedBy.includes(username)) {
            _context.next = 28;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'You have already disliked this post'
          }));

        case 28:
          post.dislikes += 1;
          post.dislikedBy.push(username); // Add the user to the dislikedBy array
          // Handle the "comment" action

          _context.next = 39;
          break;

        case 32:
          if (!(action === 'comment')) {
            _context.next = 38;
            break;
          }

          if (!(!comment || !comment.trim())) {
            _context.next = 35;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'Comment cannot be empty'
          }));

        case 35:
          post.comments.push({
            username: username,
            comment: comment,
            timestamp: new Date()
          });
          _context.next = 39;
          break;

        case 38:
          return _context.abrupt("return", res.status(400).json({
            message: 'Invalid action type'
          }));

        case 39:
          _context.next = 41;
          return regeneratorRuntime.awrap(post.save());

        case 41:
          return _context.abrupt("return", res.json(post));

        case 44:
          res.status(405).json({
            message: 'Method Not Allowed'
          });

        case 45:
          _context.next = 51;
          break;

        case 47:
          _context.prev = 47;
          _context.t0 = _context["catch"](5);
          console.error(_context.t0);
          res.status(500).json({
            message: 'Error updating post',
            error: _context.t0
          });

        case 51:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[5, 47]]);
}
//# sourceMappingURL=editPost.dev.js.map
