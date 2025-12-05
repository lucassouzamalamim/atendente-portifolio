package com.lucasdev.portfolio.repository;

import com.lucasdev.portfolio.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByOrderByTimestampAsc();
}
