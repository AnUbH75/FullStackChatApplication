package com.chat.chat_app_backend.Repository;

import com.chat.chat_app_backend.entity.chatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface chatRoomRepo extends MongoRepository<chatRoom,String> {

    chatRoom findByRoomId(String roomId);

}
