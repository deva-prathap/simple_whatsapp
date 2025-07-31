const cron = require('node-cron');
const moment = require('moment');
const db = require('../config/db');

let whatsappClientInstance; // store client globally

function initialize(whatsappClient) {
  whatsappClientInstance = whatsappClient;

  async function checkUpcomingLoans() {
    try {
      const [loans] = await db.query(`
        SELECT * FROM loans 
        WHERE DATEDIFF(due_date, CURDATE()) = 2
        AND due_date > CURDATE()
        AND deleted = "0"
      `);

      for (const loan of loans) {
        await sendReminder(loan);
      }
    } catch (error) {
      console.error('❌ Error checking loans:', error);
    }
  }

  // Schedule the cron to run every day at 9 AM IST
  cron.schedule('0 9 * * *', checkUpcomingLoans, {
    timezone: "Asia/Kolkata"
  });

  console.log('📅 Loan reminder service started - checking daily at 9 AM');
}

// async function sendReminder(loan) {
//   const dueDate = moment(loan.due_date).format('DD MMM YYYY');
//   const message = `🔔 *Loan Payment Reminder* 🔔\n\n` +
//                   `🏢 *Company:* ${loan.company_name}\n` +
//                   `💰 *Amount:* ₹${loan.loan_amount.toLocaleString()}\n` +
//                   `📅 *Due Date:* ${dueDate}\n\n` +
//                   `⚠️ This payment is due in *2 days*.`;

//   console.log(`📤 Sending reminder for loan ID ${loan.id}:\n${message}`);

//   try {
//     if (!whatsappClientInstance) throw new Error("WhatsApp client not initialized.");

//     const recipientNumber = '918608227809'; // Format: countrycode + number (no +)
//     const chatId = `${recipientNumber}@c.us`;

//     await whatsappClientInstance.sendMessage(chatId, message);
//     console.log(`✅ Reminder sent to ${recipientNumber} for ${loan.company_name}`);

//     // Update last reminder sent time
//     await db.query(
//       'UPDATE loans SET last_reminder_sent = NOW() WHERE id = ?',
//       [loan.id]
//     );
//   } catch (error) {
//     console.error(`❌ Error sending reminder for ${loan.company_name}:`, error);
//   }
// }

async function sendReminder(loan) {
  const dueDate = moment(loan.due_date).format('DD MMM YYYY');
  const message = `🔔 *Loan Payment Reminder* 🔔\n\n` +
                  `🏢 *Company:* ${loan.company_name}\n` +
                  `💰 *Amount:* ₹${loan.loan_amount.toLocaleString()}\n` +
                  `📅 *Due Date:* ${dueDate}\n\n` +
                  `⚠️ This payment is due in *2 days*.`;

  console.log(`📤 Sending reminder for loan ID ${loan.id}:\n${message}`);

  try {
    if (!whatsappClientInstance) throw new Error("WhatsApp client not initialized.");

    const recipientNumber = '918608227809'; // no "+" symbol
    const chatId = `${recipientNumber}@c.us`;

    // Check if chat exists or force create it
    const chat = await whatsappClientInstance.getChatById(chatId);

    await whatsappClientInstance.sendMessage(chat.id._serialized, message);
    console.log(`✅ Reminder sent to ${recipientNumber} for ${loan.company_name}`);

    await db.query(
      'UPDATE loans SET last_reminder_sent = NOW() WHERE id = ?',
      [loan.id]
    );
  } catch (error) {
    console.error(`❌ Error sending reminder for ${loan.company_name}:`, error.message || error);
    console.warn(`⚠️ Make sure the number ${recipientNumber} has messaged your bot at least once.`);
  }
}


module.exports = {
  initialize,
  sendReminder
};


// const cron = require('node-cron');
// const moment = require('moment');
// const db = require('../config/db');

// function initialize(whatsappClient) {
//   async function checkUpcomingLoans() {
//     try {
//       const [loans] = await db.query(`
//         SELECT * FROM loans 
//         WHERE DATEDIFF(due_date, CURDATE()) = 2
//         AND due_date > CURDATE()
//       `);
      
//       for (const loan of loans) {
//         await sendReminder(loan);
//       }
//     } catch (error) {
//       console.error('Error checking loans:', error);
//     }
//   }

//   async function sendReminder(loan) {
//     const dueDate = moment(loan.due_date).format('DD MMM YYYY');
//     const message = `🔔 Loan Payment Reminder 🔔\n\n` +
//                    `Company: ${loan.company_name}\n` +
//                    `Amount: ₹${loan.loan_amount.toLocaleString()}\n` +
//                    `Due Date: ${dueDate}\n\n` +
//                    `This payment is due in 2 days.`;

//     console.log(`📤 Sending reminder check is send or not the message :`);
    
//     try {
//       const chats = await whatsappClient.getChats();
//       const myChat = chats.find(chat => chat.isMe);
      
//       if (myChat) {
//         await whatsappClient.sendMessage(myChat.id._serialized, message);
//         console.log(`Reminder sent for ${loan.company_name}`);
        
//         // Update last reminder sent time
//         await db.query(
//           'UPDATE loans SET last_reminder_sent = NOW() WHERE id = ?',
//           [loan.id]
//         );
//       }
//     } catch (error) {
//       console.error(`Error sending reminder for ${loan.company_name}:`, error);
//     }
//   }

//   // Run daily at 9 AM
//   cron.schedule('0 9 * * *', checkUpcomingLoans, {
//     timezone: "Asia/Kolkata"
//   });
  
//   console.log('Loan reminder service started - checking daily at 9 AM');
// }

// module.exports = {
//   initialize
// };