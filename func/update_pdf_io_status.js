const updateProgressStatus = function ( data, socket ) {
    if (data.status === "started" || data.status === "progress" || data.status === "completed") {
        console.log(data)
        socket.to(data.userId).emit("update_progress_bar", data)
    }
};

module.exports = updateProgressStatus;