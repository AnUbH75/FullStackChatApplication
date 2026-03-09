package com.chat.chat_app_backend.Controller;

import com.chat.chat_app_backend.Repository.chatRoomRepo;
import com.chat.chat_app_backend.entity.Message;
import com.chat.chat_app_backend.entity.chatRoom;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;


@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("http://localhost:5173")
public class roomController {

    private chatRoomRepo roomRepo;

    public roomController(chatRoomRepo roomRepo) {
        this.roomRepo = roomRepo;
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId){
        if(roomRepo.findByRoomId(roomId) != null){
            return ResponseEntity.badRequest().body("Room already exists");
        }
        chatRoom room = new chatRoom();
        room.setRoomId(roomId);
        roomRepo.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId){
        chatRoom room = roomRepo.findByRoomId(roomId);
        if(room == null){
            return ResponseEntity.badRequest().body("Room does not exists");
        }
        return ResponseEntity.ok(room);
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size
    ){
        chatRoom room = roomRepo.findByRoomId(roomId);
        if(room == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Message> messages = room.getMessages();
        int st = Math.max(0, messages.size()-(page + 1)*size);
        int end = Math.min(messages.size(), st+size);
        List<Message> paginatedMessages = messages.subList(st, end);
        return ResponseEntity.ok(paginatedMessages);
    }
}
