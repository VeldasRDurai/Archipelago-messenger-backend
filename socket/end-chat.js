// const mongoose = require("mongoose");

const { activeUsers } = require('../database/database');

const endChat = async ({ socket }) => {
    try {
        const ack1 = await activeUsers.updateOne({'socketId':socket.id},
            { 'isChatting':false, 'chattingWithEmail':undefined, 'chattingWithName':undefined, 'chattingWithId':undefined });
    } catch (e){ console.log(e); }
}

module.exports = { endChat };