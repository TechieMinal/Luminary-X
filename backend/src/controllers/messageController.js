const Message = require('../models/Message');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// GET /api/messages/conversations
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const otherId =
          conv.lastMessage.sender.toString() === userId.toString()
            ? conv.lastMessage.receiver
            : conv.lastMessage.sender;

        const participant = await User.findById(otherId).select('name avatar role lastSeen');
        return {
          conversationId: conv._id,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          participant,
        };
      })
    );

    // Return flat array — matches frontend expectation: res.data.data (array)
    return sendSuccess(res, populated, 'Conversations fetched');
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/:userId
const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const ids = [req.user._id.toString(), userId].sort();
    const conversationId = ids.join('_');

    const total = await Message.countDocuments({ conversationId });
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Mark received messages as read
    await Message.updateMany(
      { conversationId, receiver: req.user._id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    return sendPaginated(
      res,
      messages.reverse(),
      { total, page, limit, pages: Math.ceil(total / limit) },
      'Messages fetched'
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/messages
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return sendError(res, 'Receiver and content are required', 400);
    }
    if (receiverId === req.user._id.toString()) {
      return sendError(res, 'You cannot message yourself', 400);
    }

    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.isActive) {
      return sendError(res, 'Recipient not found', 404);
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
    });

    // Return populated message — matches frontend: res.data.data (the object)
    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    return sendSuccess(res, populated, 'Message sent', 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/unread
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false,
    });
    return sendSuccess(res, { count }, 'Unread count fetched');
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/users?search=
const searchUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {
      _id: { $ne: req.user._id },
      isActive: true,
    };
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const users = await User.find(query).select('name avatar role').limit(20);
    return sendSuccess(res, users, 'Users fetched');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/messages/:id
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return sendError(res, 'Message not found', 404);
    if (message.sender.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to delete this message', 403);
    }
    await Message.findByIdAndDelete(req.params.id);
    return sendSuccess(res, {}, 'Message deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  searchUsers,
  deleteMessage,
};
