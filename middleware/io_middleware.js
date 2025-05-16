const jwt = require('jsonwebtoken');
const User = require('../models/user');

const socketAuthMiddleware = async (socket) => {
    try {
        // Get token from handshake auth or query
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            throw new Error('Authentication error: No token provided');
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.SECRET);

        // Find the user by ID from the decoded token
        const user = await User.findById(decoded._id);

        if (!user) {
            throw new Error('Authentication error: User not found')
        }

        // Attach user object to socket for future use
        socket.user = user;

        // Store user's active rooms (useful for reconnection scenarios)
        socket.activeRooms = new Set();

        // Add custom methods to socket for easier user management
        socket.joinUserRoom = async function(roomId) {
            try {
                await this.join(roomId);
                this.activeRooms.add(roomId);
                return true;
            } catch (error) {
                console.error(`Error joining room ${roomId}:`, error);
                return false;
            }
        };

        socket.leaveUserRoom = async function(roomId) {
            try {
                await this.leave(roomId);
                this.activeRooms.delete(roomId);
                return true;
            } catch (error) {
                console.error(`Error leaving room ${roomId}:`, error);
                return false;
            }
        };

        // Add listener for disconnection to clean up rooms
        socket.on('disconnect', () => {
            socket.activeRooms.clear();
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
             throw new Error('Authentication error: Token has expired');
        }
        throw new Error('Authentication error: Invalid token');
    }
};

// Example usage with Socket.IO server
const useSocketAuth = (io) => {
    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        console.log(`Authenticated user connected: ${socket.user.username}`);

        // Example of using the attached user object
        socket.on('join_room', async (roomId) => {
            if (socket.user.roles.includes('admin') || socket.user.roles.includes('user')) {
                const success = await socket.joinUserRoom(roomId);
                if (success) {
                    io.to(roomId).emit('user_joined', {
                        userId: socket.user._id,
                        username: socket.user.username,
                        roomId: roomId
                    });
                }
            } else {
                socket.emit('error', {
                    type: 'PERMISSION_DENIED',
                    message: 'You do not have permission to join this room'
                });
            }
        });

        // Handle room leaving with user data
        socket.on('leave_room', async (roomId) => {
            const success = await socket.leaveUserRoom(roomId);
            if (success) {
                io.to(roomId).emit('user_left', {
                    userId: socket.user._id,
                    username: socket.user.username,
                    roomId: roomId
                });
            }
        });

        // Example of role-based event handling
        socket.on('admin_action', (data) => {
            if (socket.user.roles.includes('admin')) {
                // Process admin action
                console.log(`Admin ${socket.user.username} performed action:`, data);
            } else {
                socket.emit('error', {
                    type: 'PERMISSION_DENIED',
                    message: 'Admin privileges required'
                });
            }
        });
    });
};

module.exports = { socketAuthMiddleware, useSocketAuth };