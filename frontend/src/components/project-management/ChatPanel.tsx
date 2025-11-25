'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Send, Smile, Paperclip, MoreVertical, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ChatPanelProps {
  projectId: string | null;
  userToken?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  isEdited?: boolean;
  reactions?: Record<string, string[]>;
}

interface TypingUser {
  userId: string;
  userName: string;
}

export default function ChatPanel({ projectId, userToken }: ChatPanelProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize Socket.IO connection
  useEffect(() => {
    // Get token from props or localStorage
    const token = userToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
    
    // Silent return if no project selected (normal state)
    if (!projectId) {
      return;
    }

    // Log error only if missing token (actual error)
    if (!token) {
      console.error('[ChatPanel] Missing authentication token');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:12001';
    console.log('[ChatPanel] Connecting to:', `${socketUrl}/project-chat`);
    
    const newSocket = io(`${socketUrl}/project-chat`, {
      auth: {
        token: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
      setHasError(false);
      setErrorMessage('');
      console.log('✅ Connected to chat');
      
      // Debug: Log user info
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        console.log('[ChatPanel] 🔍 Debug:', {
          userId: user?.id,
          userEmail: user?.email,
          projectId,
        });
      } catch (e) {
        console.error('[ChatPanel] Error parsing user:', e);
      }
      
      // Join project with callback to handle errors
      newSocket.emit('join_project', { projectId }, (response: any) => {
        console.log('[ChatPanel] 📩 Join response:', response);
        
        if (response?.success) {
          setOnlineUsers(response.onlineUsers || []);
          
          // Request to load messages after successfully joining
          newSocket.emit('load_messages', {
            projectId,
            take: 50,
            skip: 0,
          });
        } else if (response?.error) {
          console.error('[ChatPanel] ❌ Join failed:', response.error);
          setHasError(true);
          
          // Parse error message for better UX
          let displayMessage = response.error;
          if (response.error?.toLowerCase().includes('not a project member')) {
            displayMessage = 'Bạn không phải là thành viên của dự án này';
          } else if (response.error?.toLowerCase().includes('not authenticated')) {
            displayMessage = 'Phiên đăng nhập đã hết hạn';
          }
          
          setErrorMessage(displayMessage);
        }
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from chat');
    });

    // Chat events
    newSocket.on('new_message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, { ...message, createdAt: new Date(message.createdAt) }]);
    });

    newSocket.on('messages_loaded', (loadedMessages: ChatMessage[]) => {
      setMessages(
        loadedMessages.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }))
      );
    });

    newSocket.on('message_edited', (data: { messageId: string; content: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId ? { ...m, content: data.content, isEdited: true } : m
        )
      );
    });

    newSocket.on('message_deleted', (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
    });

    newSocket.on('reaction_added', (data: { messageId: string; userId: string; emoji: string }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === data.messageId) {
            const reactions = m.reactions || {};
            reactions[data.emoji] = reactions[data.emoji] || [];
            if (!reactions[data.emoji].includes(data.userId)) {
              reactions[data.emoji].push(data.userId);
            }
            return { ...m, reactions };
          }
          return m;
        })
      );
    });

    newSocket.on('user_typing', (data: { userId: string; userName: string }) => {
      setTypingUsers((prev) => {
        if (!prev.find((u) => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    newSocket.on('user_stopped_typing', (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    newSocket.on('online_users', (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('user_joined', (data: { userId: string; userName: string }) => {
      toast({
        title: 'User Joined',
        description: `${data.userName} joined the chat`,
        type: 'info',
      });
    });

    newSocket.on('user_left', (data: { userId: string; userName: string }) => {
      toast({
        title: 'User Left',
        description: `${data.userName} left the chat`,
        type: 'info',
      });
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('[ChatPanel] Socket error:', error);
      setHasError(true);
      
      // Parse error message for better UX
      let displayMessage = error.message;
      if (error.message?.toLowerCase().includes('not a project member')) {
        displayMessage = 'Bạn không phải là thành viên của dự án này';
      } else if (error.message?.toLowerCase().includes('permission')) {
        displayMessage = 'Bạn không có quyền truy cập chat này';
      } else if (error.message?.toLowerCase().includes('unauthorized')) {
        displayMessage = 'Phiên đăng nhập đã hết hạn';
      }
      
      setErrorMessage(displayMessage);
      
      // Only show toast for non-permission errors
      if (!error.message?.toLowerCase().includes('not a project member')) {
        toast({
          title: '❌ Lỗi Chat',
          description: displayMessage,
          type: 'error',
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave_project', { projectId });
      newSocket.close();
    };
  }, [projectId, userToken, toast]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !socket || !isConnected) return;

    socket.emit('send_message', {
      projectId,
      content: messageInput,
      attachments: [],
    });

    setMessageInput('');
    socket.emit('typing_stop', { projectId });
  };

  const handleTyping = () => {
    if (!socket || !isConnected) return;

    socket.emit('typing_start', { projectId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { projectId });
    }, 3000);
  };

  const handleMessageReaction = (messageId: string, emoji: string) => {
    if (!socket || !isConnected) return;

    socket.emit('message_reaction', {
      messageId,
      emoji,
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('delete_message', { messageId });
  };

  const handleLoadMore = () => {
    if (!socket || !isConnected) return;

    socket.emit('load_messages', {
      projectId,
      take: 50,
      skip: messages.length,
    });
  };

  // Show error state if user doesn't have permission
  if (hasError && errorMessage) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 p-3 sm:p-4">
        <div className="text-center max-w-md mx-auto space-y-4">
          <div className="rounded-full bg-destructive/10 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto">
            <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-base sm:text-lg">
              Không thể kết nối chat
            </h3>
            <p className="text-sm text-muted-foreground">
              {errorMessage}
            </p>
            <p className="text-xs text-muted-foreground">
              Bạn cần được thêm vào dự án để có thể trò chuyện với các thành viên khác.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center max-w-xs px-4">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Chọn một dự án để xem chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-white sticky top-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <h3 className="font-semibold">Project Chat</h3>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Loader className="h-3 w-3 animate-spin" />
                Connecting...
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {onlineUsers.length} online
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.userAvatar} />
                  <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{message.userName}</span>
                    <span className="text-xs text-gray-500">
                      {message.createdAt.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>

                  <p className="text-sm text-foreground break-words">{message.content}</p>

                  {/* Reactions */}
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {Object.entries(message.reactions).map(([emoji, users]) => (
                        <div
                          key={emoji}
                          className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs cursor-pointer hover:bg-gray-200"
                          onClick={() => handleMessageReaction(message.id, emoji)}
                        >
                          <span>{emoji}</span>
                          <span className="text-gray-600">{users.length}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMessageReaction(message.id, '👍')}
                    >
                      👍
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMessageReaction(message.id, '❤️')}
                    >
                      ❤️
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex gap-2 text-xs text-gray-500">
              <span>{typingUsers.map((u) => u.userName).join(', ')} is typing...</span>
              <span className="animate-pulse">●●●</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="h-10 w-10 p-0">
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={!isConnected}
            className="flex-1"
          />

          <Button
            size="sm"
            variant="ghost"
            className="h-10 w-10 p-0"
            onClick={() => handleMessageReaction(messages[messages.length - 1]?.id || '', '😊')}
          >
            <Smile className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!isConnected || isLoading}
            className="h-10 w-10 p-0"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
