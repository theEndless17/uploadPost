"use strict";

function showNotification(message) {
  var isError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var notificationElement = document.getElementById('notification');
  var messageElement = document.getElementById('notificationMessage');
  messageElement.textContent = message; // Set the style for error or success

  if (isError) {
    notificationElement.classList.add('error-notification');
  } else {
    notificationElement.classList.remove('error-notification');
  } // Show the notification with animation


  notificationElement.classList.add('show-notification'); // Hide after 3 seconds

  setTimeout(function () {
    notificationElement.classList.remove('show-notification');
  }, 3000);
} // Function to toggle between light and dark mode


function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  var modeIcon = document.querySelector('.mode-toggle'); // Switch emoji based on the current mode

  if (document.body.classList.contains('dark-mode')) {
    modeIcon.textContent = '🌞'; // Sun for light mode
  } else {
    modeIcon.textContent = '🌙'; // Moon for dark mode
  }
}

document.getElementById('fabBtn').addEventListener('click', function (event) {
  event.stopPropagation();
  var navOptions = document.querySelector('.nav-options');
  navOptions.classList.toggle('visible');
});

function showContent(contentId) {
  var overlay = document.getElementById('overlay');
  var allContent = document.querySelectorAll('.content'); // Hide all content sections

  allContent.forEach(function (content) {
    content.classList.remove('visible');
    content.classList.add('hidden');
  }); // Show the selected content

  var contentToShow = document.getElementById(contentId);

  if (contentToShow) {
    contentToShow.classList.remove('hidden');
    contentToShow.classList.add('visible');
    overlay.classList.add('visible'); // Show the overlay
  } // Close the menu options


  var navOptions = document.querySelector('.nav-options');
  navOptions.classList.remove('visible');
} // Event listeners for buttons to show content


document.getElementById('termsBtn').addEventListener('click', function () {
  showContent('termsContent');
});
document.getElementById('contactBtn').addEventListener('click', function () {
  showContent('contactContent');
});
document.getElementById('communityBtn').addEventListener('click', function () {
  showContent('communityContent');
}); // Close the overlay when the close button is clicked

document.getElementById('closeBtn').addEventListener('click', function () {
  var overlay = document.getElementById('overlay');
  overlay.classList.remove('visible');
}); // Prevent hiding the overlay when clicking inside the content container

document.getElementById('overlay').addEventListener('click', function (event) {
  var contentContainer = document.querySelector('.content-container');

  if (!contentContainer.contains(event.target)) {
    overlay.classList.remove('visible');
  }
});
//# sourceMappingURL=script.dev.js.map
