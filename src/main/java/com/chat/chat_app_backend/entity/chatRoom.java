package com.chat.chat_app_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

@Document(collection = "rooms")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class chatRoom {
    @Id
    private String id;

    private String roomId;

    private List<Message> messages = new ArrayList<>();
}
