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
  sessionId: String
}); // Create the model for posts

var Post = _mongoose["default"].model('Post', postSchema); // Set CORS headers


var setCorsHeaders = function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins or specify your domain

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed methods

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers
}; // Serverless API handler for handling different request types


function handler(req, res) {
  var _req$body, postId, username, sessionId, post;

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
          _context.next = 6;
          return regeneratorRuntime.awrap((0, _db.connectToDatabase)());

        case 6:
          if (!(req.method === 'DELETE')) {
            _context.next = 29;
            break;
          }

          _context.prev = 7;
          _req$body = req.body, postId = _req$body.postId, username = _req$body.username, sessionId = _req$body.sessionId; // Check that the required fields are present

          if (!(!postId || !username || !sessionId)) {
            _context.next = 11;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'Missing required fields: postId, username, sessionId'
          }));

        case 11:
          _context.next = 13;
          return regeneratorRuntime.awrap(Post.findById(postId));

        case 13:
          post = _context.sent;

          if (post) {
            _context.next = 16;
            break;
          }

          return _context.abrupt("return", res.status(404).json({
            message: 'Post not found'
          }));

        case 16:
          if (!(post.username !== username)) {
            _context.next = 18;
            break;
          }

          return _context.abrupt("return", res.status(403).json({
            message: 'You can only delete your own posts'
          }));

        case 18:
          _context.next = 20;
          return regeneratorRuntime.awrap(post.deleteOne());

        case 20:
          res.status(200).json({
            message: 'Post deleted successfully'
          });
          _context.next = 27;
          break;

        case 23:
          _context.prev = 23;
          _context.t0 = _context["catch"](7);
          console.error(_context.t0);
          res.status(500).json({
            message: 'Error deleting post',
            error: _context.t0
          });

        case 27:
          _context.next = 30;
          break;

        case 29:
          res.status(405).json({
            message: 'Method Not Allowed'
          });

        case 30:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[7, 23]]);
}
//# sourceMappingURL=deletePost.dev.js.map
