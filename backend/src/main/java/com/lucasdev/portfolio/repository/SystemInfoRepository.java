package com.lucasdev.portfolio.repository;

import com.lucasdev.portfolio.model.SystemInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemInfoRepository extends JpaRepository<SystemInfo, Long> {
}
