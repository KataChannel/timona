'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useMutation } from '@apollo/client';
import { CREATE_SUPPORT_CONVERSATION, SEND_SUPPORT_MESSAGE } from '@/graphql/support-chat/support-chat.graphql';
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  ChevronDown,
  CheckCheck,
  Bot,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  senderType: 'CUSTOMER' | 'AGENT' | 'BOT';
  senderName?: string;
  sentAt: string;
  isRead: boolean;
  isAIGenerated?: boolean;
}

interface SupportChatWidgetProps {
  apiUrl?: string;
  websocketUrl?: string;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left';
}

export default function SupportChatWidget({
  apiUrl = 'http://localhost:3001',
  websocketUrl = 'http://localhost:3001/support-chat',
  primaryColor = '#2563eb',
  position = 'bottom-right',
}: SupportChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Apollo mutations
  const [createConversationMutation] = useMutation(CREATE_SUPPORT_CONVERSATION);
  const [sendMessageMutation] = useMutation(SEND_SUPPORT_MESSAGE);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (isOpen && !socket) {
      const newSocket = io(websocketUrl, {
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to support chat');
      });

      newSocket.on('new_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
        if (message.senderType !== 'CUSTOMER') {
          setUnreadCount(prev => prev + 1);
        }
        scrollToBottom();
      });

      newSocket.on('ai_suggestion', (data: any) => {
        console.log('AI Suggestion:', data);
      });

      newSocket.on('user_typing', () => {
        setIsTyping(true);
      });

      newSocket.on('user_stopped_typing', () => {
        setIsTyping(false);
      });

      newSocket.on('agent_assigned', (data: any) => {
        setAgentInfo(data.agent);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, websocketUrl]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start conversation
  const startConversation = async () => {
    if (!customerName.trim()) return;

    try {
      const { data } = await createConversationMutation({
        variables: {
          input: {
            customerName,
            platform: 'WEBSITE',
          },
        },
      });

      if (!data?.createSupportConversation) {
        throw new Error('Failed to create conversation');
      }
      
      const conversation = data.createSupportConversation;
      
      setConversationId(conversation.id);
      setShowNameInput(false);

      // Join conversation via WebSocket
      if (socket) {
        socket.emit('join_conversation', {
          conversationId: conversation.id,
        });
      }

      // Send welcome message
      setMessages([
        {
          id: '1',
          content: `Xin chào ${customerName}! Tôi có thể giúp gì cho bạn?`,
          senderType: 'BOT',
          senderName: 'Trợ lý ảo',
          sentAt: new Date().toISOString(),
          isRead: true,
          isAIGenerated: true,
        },
      ]);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;

    const messageContent = inputMessage;
    setInputMessage(''); // Clear input immediately

    try {
      // Send via GraphQL mutation to save in DB
      const { data } = await sendMessageMutation({
        variables: {
          input: {
            conversationId,
            content: messageContent,
            senderType: 'CUSTOMER',
            senderName: customerName,
          },
        },
      });

      // Also send via WebSocket for real-time
      if (socket && data?.sendSupportMessage) {
        socket.emit('send_message', {
          conversationId,
          messageId: data.sendSupportMessage.id,
          content: messageContent,
          senderType: 'CUSTOMER',
          senderName: customerName,
        });
      }

      // Add to local messages (optimistic update)
      setMessages(prev => [...prev, {
        id: data?.sendSupportMessage?.id || Date.now().toString(),
        content: messageContent,
        senderType: 'CUSTOMER',
        senderName: customerName,
        sentAt: new Date().toISOString(),
        isRead: false,
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setInputMessage(messageContent); // Restore message on error
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (socket && conversationId) {
      socket.emit('typing_start', {
        conversationId,
        userId: 'customer',
      });

      setTimeout(() => {
        socket.emit('typing_stop', {
          conversationId,
          userId: 'customer',
        });
      }, 3000);
    }
  };

  const positionClasses = position === 'bottom-right' 
    ? 'right-4 sm:right-6' 
    : 'left-4 sm:left-6';

  return (
    <>
      {/* Chat Button - Shadcn UI Button with Motion */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "fixed bottom-4 sm:bottom-6 z-50",
              positionClasses
            )}
          >
            <Button
              size="lg"
              className={cn(
                "relative h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl text-white border-0",
                "hover:scale-110 active:scale-95 transition-transform hover:opacity-90",
                "bg-[var(--chat-primary)] hover:bg-[var(--chat-primary)]"
              )}
              style={{ '--chat-primary': primaryColor } as React.CSSProperties}
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window - Shadcn UI Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-4 sm:bottom-6 z-50",
              "w-[calc(100vw-2rem)] sm:w-96",
              positionClasses
            )}
            style={{
              maxHeight: isMinimized ? '64px' : 'calc(100vh - 8rem)',
              height: isMinimized ? 'auto' : '600px',
            }}
          >
            <Card className="h-full flex flex-col shadow-2xl border-0">
              {/* Header - Shadcn CardHeader */}
              <CardHeader
                className="p-4 text-white relative overflow-hidden cursor-pointer"
                style={{ backgroundColor: primaryColor }}
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {/* Animated background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute w-32 h-32 bg-white rounded-full -top-10 -left-10 animate-pulse" />
                  <div className="absolute w-24 h-24 bg-white rounded-full -bottom-5 -right-5 animate-pulse" 
                       style={{ animationDelay: '300ms' }} />
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarImage src={agentInfo?.avatar} alt={agentInfo?.name} />
                      <AvatarFallback className="bg-white/20">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">
                        {agentInfo?.name || 'Hỗ trợ khách hàng'}
                      </h3>
                      <p className="text-xs opacity-90">
                        {isTyping ? 'Đang nhập...' : 'Trực tuyến'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMinimized(!isMinimized);
                      }}
                    >
                      <ChevronDown 
                        className={cn(
                          "h-5 w-5 transition-transform",
                          isMinimized && "rotate-180"
                        )} 
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        setUnreadCount(0);
                      }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  {/* Messages Area - Shadcn ScrollArea */}
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full px-4 py-4">
                      {showNameInput ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card className="p-6 border-0 shadow-sm">
                            <h4 className="font-semibold mb-2 text-foreground">
                              Chào mừng bạn! 👋
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Vui lòng cho chúng tôi biết tên của bạn để bắt đầu hội thoại.
                            </p>
                            <Input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && startConversation()}
                              placeholder="Nhập tên của bạn..."
                              className="mb-3"
                            />
                            <Button
                              onClick={startConversation}
                              disabled={!customerName.trim()}
                              className={cn(
                                "w-full text-white border-0",
                                "bg-[var(--chat-primary)] hover:bg-[var(--chat-primary)] hover:opacity-90"
                              )}
                              style={{ '--chat-primary': primaryColor } as React.CSSProperties}
                            >
                              Bắt đầu chat
                            </Button>
                          </Card>
                        </motion.div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message, index) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "flex",
                                message.senderType === 'CUSTOMER' ? 'justify-end' : 'justify-start'
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                                  message.senderType === 'CUSTOMER'
                                    ? 'text-white rounded-br-sm'
                                    : 'bg-muted text-foreground rounded-bl-sm'
                                )}
                                style={{
                                  backgroundColor: message.senderType === 'CUSTOMER' ? primaryColor : undefined,
                                }}
                              >
                                {message.senderType !== 'CUSTOMER' && (
                                  <div className="flex items-center space-x-1 mb-1">
                                    {message.isAIGenerated ? (
                                      <Bot className="h-3 w-3 text-primary" />
                                    ) : (
                                      <User className="h-3 w-3 text-muted-foreground" />
                                    )}
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {message.senderName}
                                    </span>
                                  </div>
                                )}
                                <p className="text-sm leading-relaxed">{message.content}</p>
                                <div className="flex items-center justify-end space-x-1 mt-1">
                                  <span className={cn(
                                    "text-xs",
                                    message.senderType === 'CUSTOMER' ? 'text-white/70' : 'text-muted-foreground'
                                  )}>
                                    {new Date(message.sentAt).toLocaleTimeString('vi-VN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {message.senderType === 'CUSTOMER' && (
                                    <CheckCheck
                                      className={cn(
                                        "h-3.5 w-3.5",
                                        message.isRead ? 'text-blue-300' : 'text-white/50'
                                      )}
                                    />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}

                          {isTyping && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex justify-start"
                            >
                              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
                                       style={{ animationDelay: '150ms' }} />
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
                                       style={{ animationDelay: '300ms' }} />
                                </div>
                              </div>
                            </motion.div>
                          )}

                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>

                  {/* Input Area - Shadcn UI Components */}
                  {!showNameInput && (
                    <div className="p-4 border-t bg-background">
                      <div className="flex items-end space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="flex-shrink-0"
                          title="Đính kèm file"
                        >
                          <Paperclip className="h-5 w-5" />
                        </Button>

                        <div className="flex-1">
                          <Input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => {
                              setInputMessage(e.target.value);
                              handleTyping();
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Nhập tin nhắn..."
                            className="rounded-xl"
                          />
                        </div>

                        <Button
                          size="icon"
                          onClick={sendMessage}
                          disabled={!inputMessage.trim()}
                          className={cn(
                            "flex-shrink-0 rounded-xl text-white border-0",
                            "bg-[var(--chat-primary)] hover:bg-[var(--chat-primary)] hover:opacity-90"
                          )}
                          style={{ '--chat-primary': primaryColor } as React.CSSProperties}
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Quick Replies */}
                      {messages.length === 1 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-auto py-1.5 px-3 text-xs rounded-full"
                          >
                            💰 Giá sản phẩm
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-auto py-1.5 px-3 text-xs rounded-full"
                          >
                            📦 Theo dõi đơn hàng
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-auto py-1.5 px-3 text-xs rounded-full"
                          >
                            🚚 Vận chuyển
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
