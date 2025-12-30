import React, { useState } from 'react';

const conversations = [
  {
    id: 1,
    name: "Pemba Sherpa",
    avatar: "👤",
    lastMessage: "Looking forward to meeting you tomorrow at 9 AM!",
    time: "2h ago",
    unread: true,
    experience: "Hidden Temple Morning Walk"
  },
  {
    id: 2,
    name: "Sita Thapa",
    avatar: "👤",
    lastMessage: "The street food tour will be amazing, I've planned some special stops!",
    time: "1d ago",
    unread: false,
    experience: "Street Food Adventure"
  },
  {
    id: 3,
    name: "LocalLink Support",
    avatar: "🎧",
    lastMessage: "Thank you for your feedback! We're glad you enjoyed your experience.",
    time: "3d ago",
    unread: false,
    experience: null
  },
];

const messages = [
  { id: 1, sender: 'guide', text: "Hi! I'm excited to show you the hidden temples tomorrow.", time: "10:30 AM" },
  { id: 2, sender: 'user', text: "Great! Should I bring anything specific?", time: "10:45 AM" },
  { id: 3, sender: 'guide', text: "Just comfortable walking shoes and a water bottle. We'll be walking for about 2 hours.", time: "10:47 AM" },
  { id: 4, sender: 'user', text: "Perfect, thanks!", time: "11:00 AM" },
  { id: 5, sender: 'guide', text: "Looking forward to meeting you tomorrow at 9 AM!", time: "11:02 AM" },
];

function MessagesPage() {
  const [selectedConvo, setSelectedConvo] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // In real app, this would send via API
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">Messages</h1>

      <div className="card overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedConvo?.id === convo.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {convo.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className={`font-medium ${convo.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {convo.name}
                      </span>
                      <span className="text-xs text-gray-500">{convo.time}</span>
                    </div>
                    {convo.experience && (
                      <p className="text-xs text-primary-500 truncate">{convo.experience}</p>
                    )}
                    <p className={`text-sm truncate ${convo.unread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {convo.lastMessage}
                    </p>
                  </div>
                  {convo.unread && (
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConvo ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                      {selectedConvo.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedConvo.name}</h3>
                      {selectedConvo.experience && (
                        <p className="text-sm text-gray-500">{selectedConvo.experience}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary px-6 rounded-full"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
