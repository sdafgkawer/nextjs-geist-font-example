// Initialize Firebase (Replace with your Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyCXhM2wbNSFNhWA0aM1m6YNKVse2XICW6A",
    authDomain: "skool-ff23a.firebaseapp.com",
    projectId: "skool-ff23a",
    storageBucket: "skool-ff23a.firebasestorage.app",
    messagingSenderId: "973593057226",
    appId: "1:973593057226:web:93accadaaecef2d04ba133"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    console.error("Firebase initialization error:", error);
}
const auth = firebase.auth();

// Global variables
let currentUser = null;
let gameScores = {
    math: 0,
    word: 0,
    memory: 0
};

// Modal functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function showSignup() {
    closeLoginModal();
    openSignupModal();
}

function showLogin() {
    closeSignupModal();
    openLoginModal();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === signupModal) {
        closeSignupModal();
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Successful login
                currentUser = userCredential.user.email || userCredential.user.displayName || 'User';
                updateUIForLoggedInUser();
                closeLoginModal();
                showNotification(`Welcome back, ${currentUser}!`, 'success');
                
                // Clear form
                document.getElementById('emailLogin').value = '';
                document.getElementById('password').value = '';
            })
            .catch((error) => {
                console.error("Login error:", error);
                showNotification(error.message || 'Login failed. Please try again.', 'error');
            });
    } else {
        showNotification('Please fill in all fields', 'error');
    }
}

// Handle anonymous login
function handleAnonymousLogin() {
    auth.signInAnonymously()
        .then((userCredential) => {
            // On success, use 'Guest' as display name
            currentUser = "Guest";
            updateUIForLoggedInUser();
            closeLoginModal();
            showNotification("Logged in anonymously as Guest.", "success");
        })
        .catch((error) => {
            console.error("Anonymous login error:", error);
            showNotification(error.message || 'Anonymous login failed. Please try again.', 'error');
        });
}

// Handle signup form submission
function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('newUsername').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('newPassword').value;
    
    if (username && email && password) {
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Use the username if provided or fallback to the email
                currentUser = username || userCredential.user.email;
                updateUIForLoggedInUser();
                closeSignupModal();
                showNotification(`Account created successfully! Welcome, ${currentUser}!`, 'success');

                // Clear the form fields
                document.getElementById('newUsername').value = '';
                document.getElementById('email').value = '';
                document.getElementById('newPassword').value = '';
            })
            .catch((error) => {
                console.error("Signup error:", error);
                showNotification(error.message || 'Signup failed. Please try again.', 'error');
            });
    } else {
        showNotification('Please fill in all fields', 'error');
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.textContent = currentUser;
    loginBtn.onclick = logout;
    loginBtn.style.backgroundColor = '#4CAF50';
    loginBtn.style.color = '#ffffff';
}

// Logout function
function logout() {
    auth.signOut()
        .then(() => {
            currentUser = null;
            const loginBtn = document.querySelector('.login-btn');
            loginBtn.textContent = 'Login';
            loginBtn.onclick = openLoginModal;
            loginBtn.style.backgroundColor = '#ffffff';
            loginBtn.style.color = '#000000';
            showNotification('Logged out successfully', 'info');
        })
        .catch((error) => {
            showNotification(error.message, 'error');
        });
}

// Smooth scroll to games section
function scrollToGames() {
    document.getElementById('games').scrollIntoView({
        behavior: 'smooth'
    });
}

// Game functions
function playGame(gameType) {
    if (!currentUser) {
        showNotification('Please login to play games', 'warning');
        openLoginModal();
        return;
    }
    
    switch(gameType) {
        case 'math':
            playMathGame();
            break;
        case 'word':
            playWordGame();
            break;
        case 'memory':
            playMemoryGame();
            break;
        default:
            showNotification('Game not available yet', 'info');
    }
}

// Simple Math Game
function playMathGame() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const correctAnswer = num1 + num2;
    
    const userAnswer = prompt(`Math Challenge!\n\nWhat is ${num1} + ${num2}?`);
    
    if (userAnswer === null) return; // User cancelled
    
    if (parseInt(userAnswer) === correctAnswer) {
        gameScores.math += 10;
        showNotification('Correct! +10 points', 'success');
    } else {
        showNotification(`Wrong! The answer was ${correctAnswer}`, 'error');
    }
    
    updateScore();
}

// Simple Word Game
function playWordGame() {
    const words = ['javascript', 'computer', 'programming', 'website', 'developer'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const scrambled = scrambleWord(randomWord);
    
    const userAnswer = prompt(`Word Quest!\n\nUnscramble this word: ${scrambled}`);
    
    if (userAnswer === null) return; // User cancelled
    
    if (userAnswer.toLowerCase() === randomWord) {
        gameScores.word += 15;
        showNotification('Correct! +15 points', 'success');
    } else {
        showNotification(`Wrong! The word was "${randomWord}"`, 'error');
    }
    
    updateScore();
}

// Simple Memory Game
function playMemoryGame() {
    const sequence = [];
    const length = 4;
    
    // Generate random sequence
    for (let i = 0; i < length; i++) {
        sequence.push(Math.floor(Math.random() * 9) + 1);
    }
    
    alert(`Memory Master!\n\nRemember this sequence: ${sequence.join(' - ')}\n\nClick OK and then enter the sequence.`);
    
    setTimeout(() => {
        const userAnswer = prompt('Enter the sequence (separated by spaces):');
        
        if (userAnswer === null) return; // User cancelled
        
        const userSequence = userAnswer.split(' ').map(num => parseInt(num));
        
        if (JSON.stringify(userSequence) === JSON.stringify(sequence)) {
            gameScores.memory += 20;
            showNotification('Perfect memory! +20 points', 'success');
        } else {
            showNotification(`Wrong sequence! It was: ${sequence.join(' ')}`, 'error');
        }
        
        updateScore();
    }, 2000);
}

// Helper function to scramble words
function scrambleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
}

// Update score display
function updateScore() {
    const totalScore = gameScores.math + gameScores.word + gameScores.memory;
    console.log(`Current scores - Math: ${gameScores.math}, Word: ${gameScores.word}, Memory: ${gameScores.memory}, Total: ${totalScore}`);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Get notification color based on type
function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#4CAF50';
        case 'error': return '#f44336';
        case 'warning': return '#ff9800';
        case 'info': return '#2196F3';
        default: return '#333';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Skool Game Website Loaded!');
    
    // Check for existing user session
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            currentUser = user.email || user.displayName || 'User';
            updateUIForLoggedInUser();
            console.log('User already logged in:', currentUser);
        } else {
            // User is signed out
            console.log('No user logged in');
        }
    });
    
    // Add some interactive effects
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Press 'L' to open login modal
        if (event.key.toLowerCase() === 'l' && !event.ctrlKey && !event.altKey) {
            const activeElement = document.activeElement;
            if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                if (!currentUser) {
                    openLoginModal();
                } else {
                    logout();
                }
            }
        }
        
        // Press 'Escape' to close modals
        if (event.key === 'Escape') {
            closeLoginModal();
            closeSignupModal();
        }
    });
    
    // Add welcome message
    setTimeout(() => {
        showNotification('Welcome to Skool! Press "L" to login or logout', 'info');
    }, 1000);
});
