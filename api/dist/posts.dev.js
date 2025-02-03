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
  // You can replace this with a specific origin URL if necessary
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS'); // Allow specific methods

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
}; // Serverless API handler for getting posts


function handler(req, res) {
  var posts;
  return regeneratorRuntime.async(function handler$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // Set CORS headers before processing the request
          setCorsHeaders(res); // Handle pre-flight OPTIONS request

          if (!(req.method === 'OPTIONS')) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", res.status(200).end());

        case 3:
          if (!(req.method === 'GET')) {
            _context.next = 19;
            break;
          }

          _context.prev = 4;
          _context.next = 7;
          return regeneratorRuntime.awrap((0, _db.connectToDatabase)());

        case 7:
          _context.next = 9;
          return regeneratorRuntime.awrap(Post.find().sort({
            timestamp: -1
          }));

        case 9:
          posts = _context.sent;
          res.status(200).json(posts); // Send posts as a JSON response

          _context.next = 17;
          break;

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](4);
          console.error("Error retrieving posts:", _context.t0);
          res.status(500).json({
            message: 'Error retrieving posts',
            error: _context.t0
          }); // Handle any errors

        case 17:
          _context.next = 20;
          break;

        case 19:
          // If the request is not a GET request, respond with 405 Method Not Allowed
          res.status(405).json({
            message: 'Method Not Allowed'
          });

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[4, 13]]);
}
//# sourceMappingURL=posts.dev.js.map
