//package org.example.backend.configs
//
//import org.springframework.context.annotation.Configuration
//import org.springframework.scheduling.annotation.EnableAsync
//import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
//import org.springframework.context.annotation.Bean
//import java.util.concurrent.Executor
//
//@Configuration
//@EnableAsync
//class AsyncConfig {
//    @Bean(name = ["taskExecutor"])
//    fun taskExecutor(): Executor {
//        val executor = ThreadPoolTaskExecutor()
//        executor.corePoolSize = 2
//        executor.maxPoolSize = 4
//        executor.queueCapacity = 100
//        executor.setThreadNamePrefix("FormEvent-")
//        executor.initialize()
//        return executor
//    }
//}