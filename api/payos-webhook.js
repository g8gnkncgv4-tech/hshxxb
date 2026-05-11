import PayOS from "@payos/node";

import admin from "firebase-admin";

/* FIREBASE */

if(!admin.apps.length){

   admin.initializeApp({

      credential:
      admin.credential.cert({

         projectId:
         process.env.FB_PROJECT_ID,

         clientEmail:
         process.env.FB_CLIENT_EMAIL,

         privateKey:
         process.env.FB_PRIVATE_KEY
         .replace(/\\n/g,"\n")

      }),

      databaseURL:
      process.env.FB_DB_URL

   });

}

const db = admin.database();

/* PAYOS */

const payOS = new PayOS(

   process.env.CLIENT_ID,

   process.env.API_KEY,

   process.env.CHECKSUM_KEY

);

/* WEBHOOK */

export default async function handler(req,res){

   try{

      const webhookData =

      payOS.verifyPaymentWebhookData(
         req.body
      );

      console.log(
         "WEBHOOK:",
         webhookData
      );

      /*
         code = "00"
         => thanh toán thành công
      */

      if(webhookData.code === "00"){

         const amount =
         Number(webhookData.amount);

         const description =
         webhookData.description;

         /*
            VD:
            NAP123456
         */

         const match =
         description.match(
            /NAP(\d+)/
         );

         if(match){

            const userId =
            match[1];

            console.log(
               "USER:",
               userId
            );

            /* CHỐNG CỘNG 2 LẦN */

            const paidRef =
            db.ref(
               `paid/${webhookData.orderCode}`
            );

            const paidSnap =
            await paidRef.once("value");

            if(!paidSnap.exists()){

               /* BALANCE */

               const balanceRef =
               db.ref(
                  `users/${userId}/balance`
               );

               const balanceSnap =
               await balanceRef.once("value");

               const current =
               balanceSnap.val() || 0;

               const newBalance =
               current + amount;

               /* CỘNG TIỀN */

               await balanceRef.set(
                  newBalance
               );

               /* ĐÁNH DẤU */

               await paidRef.set(true);
/* UPDATE PAYMENT STATUS */
await db.ref(
   `payments/${webhookData.paymentLinkId}`
).set({

   paid:true,

   amount,

   userId,

   time:Date.now()

});
               console.log(
                  "ĐÃ CỘNG:",
                  amount
               );

               /* GỬI TELEGRAM */

               const BOT_TOKEN =
               process.env.BOT_TOKEN;

               await fetch(

                  `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,

                  {

                     method:"POST",

                     headers:{
                        "Content-Type":
                        "application/json"
                     },

                     body:JSON.stringify({

                        chat_id:userId,

                        text:
`💸 Nạp tiền thành công

➜ +${amount.toLocaleString()}đ

💰 Số dư mới:
${newBalance.toLocaleString()}đ`

                     })

                  }

               );

            }

         }

      }

      return res.status(200).json({
         error:0
      });

   }catch(err){

      console.log(err);

      return res.status(500).json({
         error:-1
      });

   }

}
