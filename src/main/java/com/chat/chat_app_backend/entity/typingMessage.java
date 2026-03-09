package com.chat.chat_app_backend.entity;

import lombok.Data;

@Data
public class typingMessage {
    private String sender;
    private String roomId;
    private boolean typing;
}
