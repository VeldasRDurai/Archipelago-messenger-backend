const mongoose = require("mongoose");

const express = require('express');
const router = express.Router();

const { chatSchema } = require('../database/chat-schema');

const pdfMake = require('../pdfmake/pdfmake');
const vfsFonts = require('../pdfmake/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const authenticationRouter = require("./authentication");
router.use('/' , authenticationRouter );

router.get('/:chattingWithName/:name/:chattingWithId/:_id', async (req, res, next) => {
  try {
    console.log(req.email);
    console.log( req.params.chattingWithName );
    console.log( req.params.name );

    const sortedId = [ req.params._id, req.params.chattingWithId ].sort();
    const chatDB = new mongoose.model( `chats${sortedId[0]}chats${sortedId[1]}`, chatSchema,`chats${sortedId[0]}chats${sortedId[1]}` );
    const oldChat = await chatDB.find();

    const capitalise = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const docDefinition = {
        content: oldChat.map( item => {
            return new Date(item.messageTime).toLocaleDateString('PT-pt', { year:'2-digit',month:'2-digit',day:'2-digit'}) + 
                ', ' + new Date().toLocaleTimeString( undefined, { hour:'2-digit',minute:'2-digit'}).toLowerCase() +
                ' - ' + (item.sendBy === req.email ? capitalise(req.params.name) : capitalise(req.params.chattingWithName) ) + 
                ': '+ item.message;
        }),
        defaultStyle: {
            fontSize: 11 ,
            bold: false,
            alignment:'left',
        }
    };
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBase64((data)=>{
        res.writeHead(200, 
        {
            'Content-Type': 'application/pdf',
            'Content-Disposition':`attachment;filename="Chat_With_${req.params.chattingWithName}.pdf"`
        });

        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
    });
  } catch(e) { 
    console.log(e)
    res.status(500).send(e); 
  }
});

module.exports = router;
