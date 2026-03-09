import React, { useState, useRef, useEffect } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { getMessages } from "../services/RoomService";
import { timeAgo } from "../config/Helper";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]); // Array for multiple users
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const typingTimeoutRef = useRef(null);

  // 1. Redirect if not connected
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, navigate]);

  // 2. Load message history
  useEffect(() => {
    async function loadMessages() {
      try {
        const mesgs = await getMessages(roomId);
        setMessages(mesgs);
      } catch (error) {
        console.error("Error loading messages", error);
      }
    }
    if (connected) {
      loadMessages();
    }
  }, [roomId, connected]);

  // 3. Auto-scroll to bottom (Triggered by new messages OR typing status)
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, typingUsers]);

  // 4. WebSocket Connection & Subscriptions
  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS("http://localhost:8080/chat");
      const client = Stomp.over(sock);
      client.debug = () => {};

      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected");

        // Subscribe to Messages
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });

        // Subscribe to Typing Status
        client.subscribe(`/topic/typing/${roomId}`, (message) => {
          const data = JSON.parse(message.body);
          if (data.sender !== currentUser) {
            setTypingUsers((prev) => {
              if (data.typing) {
                return prev.includes(data.sender)
                  ? prev
                  : [...prev, data.sender];
              } else {
                return prev.filter((user) => user !== data.sender);
              }
            });
          }
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }

    return () => {
      if (stompClient) stompClient.disconnect();
    };
  }, [roomId, connected, currentUser]);

  // 5. Handle Typing Trigger (Debounced)
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (stompClient && connected) {
      // Send "Typing" status
      stompClient.send(
        `/app/typing/${roomId}`,
        {},
        JSON.stringify({ sender: currentUser, roomId: roomId, typing: true }),
      );

      // Stop "Typing" status after 2 seconds of no keypress
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stompClient.send(
          `/app/typing/${roomId}`,
          {},
          JSON.stringify({
            sender: currentUser,
            roomId: roomId,
            typing: false,
          }),
        );
      }, 2000);
    }
  };

  // 6. Send Message
  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message),
      );

      // Immediately clear typing status when message is sent
      stompClient.send(
        `/app/typing/${roomId}`,
        {},
        JSON.stringify({ sender: currentUser, roomId: roomId, typing: false }),
      );

      setInput("");
    }
  };

  // 7. Typing Label Helper
  const getTypingLabel = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2)
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return "Several people are typing...";
  };

  function handleLogout() {
    if (stompClient) stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0b0f1a] min-h-screen text-slate-900 dark:text-white transition-colors duration-300">
      <header className="fixed top-0 left-0 w-full h-16 px-8 flex justify-between items-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-md z-50 border-b dark:border-gray-800">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
            Room
          </span>
          <h1 className="text-lg font-bold">{roomId}</h1>
        </div>

        <div className="hidden md:flex items-baseline gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            User
          </span>
          <h1 className="text-lg font-medium opacity-80">{currentUser}</h1>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
        >
          Leave
        </button>
      </header>

      <div className="w-full">
        <main
          ref={chatBoxRef}
          className="pt-24 pb-32 px-6 md:px-10 w-full max-w-4xl mx-auto h-screen overflow-y-auto flex flex-col gap-6"
        >
          {messages.map((message, index) => {
            const isMe = message.sender === currentUser;
            return (
              <div
                key={index}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <img
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`}
                    alt="avatar"
                  />
                  <div
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase text-slate-400">
                        {isMe ? "You" : message.sender}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white dark:bg-gray-800 border dark:border-gray-700 text-slate-800 dark:text-gray-100 rounded-tl-none"}`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-[9px] opacity-40 mt-1 font-medium italic">
                      {timeAgo(message.timeStamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator inside the message loop */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start items-end gap-3">
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 px-4 py-2 rounded-2xl rounded-tl-none flex flex-col gap-1">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400 italic">
                  {getTypingLabel()}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="fixed bottom-6 left-0 w-full flex justify-center z-50">
        <div className="w-full max-w-2xl px-4">
          <div className="bg-white dark:bg-gray-900 shadow-2xl dark:shadow-none border dark:border-gray-700 rounded-full px-4 py-2 flex items-center gap-2 transition-all focus-within:ring-2 ring-blue-500/50">
            <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
              <MdAttachFile size={22} />
            </button>
            <input
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              type="text"
              placeholder="Message..."
              className="flex-1 bg-transparent py-2 text-sm focus:outline-none dark:text-white"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white h-9 w-9 flex justify-center items-center rounded-full transition-all active:scale-90"
            >
              <MdSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
