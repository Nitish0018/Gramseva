
import React, { useState, useEffect, useRef } from 'react';
import { CHAT_MESSAGES } from '../constants';
import { chatApi, type ChatMessage as BackendChatMessage } from '../services/backendService';
import type { ChatMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { 
  SendIcon, 
  MicIcon, 
  AttachmentIcon, 
  SparklesIcon,
  ClockIcon,
  CheckIcon
} from './icons';
import realtimeChat, { type ChatEvent } from '../services/realtimeChatService';
import { useLanguage } from '../contexts/LanguageContext';

interface LocalChatMessage extends ChatMessage {
  isLoading?: boolean;
}

const Chat: React.FC = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<LocalChatMessage[]>(CHAT_MESSAGES);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
    loadChatHistory();
    // Connect realtime chat
    realtimeChat.connect();
    const off = realtimeChat.on((ev: ChatEvent) => {
      switch (ev.type) {
        case 'message': {
          const incoming: ChatMessage = {
            id: ev.payload.id,
            content: ev.payload.content,
            sender: ev.payload.sender,
            type: 'text',
            timestamp: new Date(ev.payload.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, incoming]);
          break;
        }
        case 'typing': {
          setIsTyping(ev.payload.isTyping);
          break;
        }
        default:
          break;
      }
    });
    return () => { off(); };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatApi.getHistory();
      if (response.success && response.data) {
        const backendMessages: ChatMessage[] = response.data.map(msg => ({
          id: msg.id,
          content: msg.message,
          sender: msg.sender,
          type: 'text' as const,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }));
        setMessages([...CHAT_MESSAGES, ...backendMessages]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const loadingMessage: LocalChatMessage = {
        id: `loading-${Date.now()}`,
        content: '',
        sender: 'bot' as const,
        type: 'text',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLoading: true
      };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Send via realtime WS immediately
    try {
      realtimeChat.sendMessage(userMessage.content);
    } catch {}

    try {
      const response = await chatApi.sendMessage(inputMessage, {
        previousMessages: messages.slice(-5) // Send last 5 messages for context
      });

      // Remove loading message and add bot response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        if (response.success && response.data) {
          const botMessage: ChatMessage = {
            id: response.data.id,
            content: response.data.message,
            sender: 'bot',
            type: 'text',
            timestamp: new Date(response.data.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          };
          return [...filtered, botMessage];
        } else {
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            content: t('chatError'),
            sender: 'bot',
            type: 'text',
            timestamp: new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          };
          return [...filtered, errorMessage];
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle error case
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          content: t('networkError'),
          sender: 'bot',
          type: 'text',
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
        return [...filtered, errorMessage];
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // typing indicator (throttled implicitly by key events)
    try { realtimeChat.sendTyping(true); } catch {}
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return timestamp;
    }
  };

  const MessageBubble = ({ msg }: { msg: ChatMessage }) => (
    <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'ml-12' : 'mr-12'}`}>
        {msg.sender === 'bot' && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <SparklesIcon className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-textSecondary font-medium">{t('aiAssistant')}</span>
          </div>
        )}
        
        <div className={`px-4 py-3 rounded-2xl shadow-soft ${
          msg.sender === 'user' 
            ? 'bg-primary text-white rounded-br-md' 
            : 'bg-white border border-border rounded-bl-md'
        }`}>
          {(msg as LocalChatMessage).isLoading ? (
            <div className="flex items-center gap-2 py-2">
              <LoadingSpinner />
              <span className="text-textSecondary text-sm">{t('thinking')}</span>
            </div>
          ) : (
            <>
              <p className="leading-relaxed">{msg.content}</p>
              <div className="flex items-center justify-between mt-2">
                <p className={`text-xs ${
                  msg.sender === 'user' ? 'text-white/70' : 'text-textSecondary'
                }`}>
                  {formatTimestamp(msg.timestamp)}
                </p>
                {msg.sender === 'user' && (
                  <CheckIcon className="h-3 w-3 text-white/70" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col max-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <SparklesIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">{t('aiAssistant')}</h1>
          <p className="text-sm text-textSecondary">{t('farmingHelp')}</p>
        </div>
        {isTyping && (
          <div className="ml-auto flex items-center gap-2 text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm">{t('aiTyping')}</span>
          </div>
        )}
      </div>
            
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4 min-h-0">
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
            
      {/* Input Area */}
      <div className="mt-4 p-4 bg-white border border-border rounded-xl shadow-soft">
        <div className="flex items-end gap-3">
          <button 
            className="p-2 text-textSecondary hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
            title={t('attachFile')}
          >
            <AttachmentIcon className="h-5 w-5" />
          </button>
          
          <button 
            className="p-2 text-textSecondary hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
            title={t('voiceMessage')}
          >
            <MicIcon className="h-5 w-5" />
          </button>
          
          <div className="flex-1 relative">
            <input 
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={() => { try { realtimeChat.sendTyping(false); } catch {} }}
              placeholder={t('askQuestion')}
              className="w-full bg-transparent px-3 py-2 focus:outline-none resize-none rounded-lg border border-border focus:border-primary"
              disabled={isLoading}
            />
          </div>
          
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`p-3 rounded-full transition-all ${
              inputMessage.trim() && !isLoading
                ? 'bg-primary text-white hover:bg-primaryDark shadow-medium hover:shadow-strong'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={t('sendMessage')}
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-textSecondary">
          <span>{t('enterToSend')}</span>
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>{t('poweredByAi')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
