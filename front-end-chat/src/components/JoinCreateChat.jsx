import React, { useState } from "react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import { useNavigate } from "react-router";
import useChatContext from "../context/ChatContext";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();

  const navigate = useNavigate();

  function handleFromInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Missing fields !!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("Joined Successfully");
        setCurrentUser(detail.userName);
        setRoomId(detail.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (err) {
        if (err.status === 400) {
          toast.error("Room does not exist");
        }
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const response = await createRoomApi(detail.roomId);
        toast.success("Room Created");
        setCurrentUser(detail.userName);
        setRoomId(detail.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (err) {
        if (err.status === 400) {
          toast.error("Room already Created");
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-[#0b0f1a] px-4">
      {/* Container - Same layout, upgraded styling */}
      <div className="p-8 w-full flex flex-col gap-6 max-w-md rounded-3xl bg-white dark:bg-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-none border border-gray-100 dark:border-gray-800 transition-all duration-500">
        {/* Icon & Heading */}
        <div className="flex flex-col gap-2">
          <img
            src={chatIcon}
            className="w-20 mx-auto drop-shadow-2xl animate-pulse"
            alt="Chat Icon"
          />
          <h1 className="text-3xl font-black text-center tracking-tight text-gray-800 dark:text-white">
            ChitChat <span className="text-blue-500">.</span>
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
            Join a room or create a new space
          </p>
        </div>

        {/* Name Input */}
        <div className="space-y-1">
          <label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1"
          >
            Identity
          </label>
          <input
            onChange={handleFromInputChange}
            value={detail.userName}
            type="text"
            id="name"
            name="userName"
            placeholder="What should we call you?"
            className="w-full bg-gray-50 dark:bg-[#1a1f2e] px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
          />
        </div>

        {/* RoomId Input */}
        <div className="space-y-1">
          <label
            htmlFor="roomId"
            className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1"
          >
            Room Code
          </label>
          <input
            onChange={handleFromInputChange}
            value={detail.roomId}
            type="text"
            id="roomId"
            name="roomId"
            placeholder="e.g. secret-base"
            className="w-full bg-gray-50 dark:bg-[#1a1f2e] px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={joinChat}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            Join Room
          </button>

          <button
            onClick={createRoom}
            className="w-full py-3.5 bg-white dark:bg-transparent border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold rounded-2xl transition-all active:scale-95"
          >
            Create New Room
          </button>
        </div>

        <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-[0.2em] mt-2">
          End-to-End Realtime Messaging
        </p>
      </div>
    </div>
  );
};

export default JoinCreateChat;
