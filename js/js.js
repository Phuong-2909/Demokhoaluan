document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".search-now").addEventListener("click", function (event) {
        event.preventDefault(); // Ngăn chặn hành vi mặc định
        window.location.href = "Chatbox.html"; // Chuyển hướng sang Chatbox
    });
});