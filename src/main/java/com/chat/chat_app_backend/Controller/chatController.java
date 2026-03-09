package com.chat.chat_app_backend.Controller;

import com.chat.chat_app_backend.Repository.chatRoomRepo;
import com.chat.chat_app_backend.entity.Message;
import com.chat.chat_app_backend.entity.chatRoom;
import com.chat.chat_app_backend.entity.typingMessage;
import com.chat.chat_app_backend.payload.MessageRequest;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Controller
@CrossOrigin("http://localhost:5173")
public class chatController {
    private chatRoomRepo roomRepo;

    public chatController(chatRoomRepo roomRepo) {
        this.roomRepo = roomRepo;
    }

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest Message
    ){

        chatRoom room = roomRepo.findByRoomId(Message.getRoomId());

        Message message = new Message();
        message.setContent(Message.getContent());
        message.setSender(Message.getSender());
        message.setTimeStamp(LocalDateTime.now());

        if(room != null){
            room.getMessages().add(message);
            roomRepo.save(room);
        }else throw new RuntimeException("room does not exist");

        return message;
    }

    @MessageMapping("/typing/{roomId}")
    @SendTo("/topic/typing/{roomId}")
    public typingMessage typing(
            @DestinationVariable String roomId,
            typingMessage message
    ) {
        return message;
    }
}
