import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Serverning URL manzili

socket.on("connect", () => {
    console.log(`Connected to server with ID: ${socket.id}`);

    // Task statusini yangilash eventini yuborish
    socket.emit("updateTaskStatus", {
        taskId: "12345",
        status: "completed",
    });

    // Task statusini yangilash eventini qabul qilish
    socket.on("taskStatusUpdated", (data) => {
        console.log("Task status updated:", data);
    });

    // Server bilan ulanishni uzish
    setTimeout(() => {
        socket.disconnect();
    }, 5000); // 5 soniyadan keyin uziladi
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});
