import PayOS from "@payos/node";

import admin from "firebase-admin";

 
if(!admin.apps.length){

   admin.initializeApp({
      credential: admin.credential.cert({
         projectId: process.env.FB_PROJECT_ID,
         clientEmail: process.env.FB_CLIENT_EMAIL,
         privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n")
      }),
      databaseURL: process.env.FB_DB_URL
   });

}

const db = admin.database();

/* PAYOS */

const payOS = new PayOS(

   process.env.CLIENT_ID,

   process.env.API_KEY,

   process.env.CHECKSUM_KEY

);

export default async function handler(req, res){

   try{

      const { userId, amount } = req.body;

      if(!userId){

         return res.status(400).json({
            error:"Thiếu userId"
         });

      }

      if(!amount || Number(amount) < 1000){

         return res.status(400).json({
            error:"Số tiền không hợp lệ"
         });

      }

      const orderCode =
      Number(Date.now());

      const description =
      `NAP${userId}`;

      // 1 giờ
      const expiredAt =
      Math.floor(Date.now()/1000)
      + (60 * 60);

      const body = {

         orderCode,

         amount:
         Number(amount),

         description,

         expiredAt,

         returnUrl:
         "https://testt-nine-flame.vercel.app/index.html",

         cancelUrl:
         "https://testt-nine-flame.vercel.app/index.html"

      };

      const paymentLink =
      await payOS.createPaymentLink(body);

      /* DATA */

      const paymentData = {

         orderCode,

         amount:
         Number(amount),

         description,

         paymentLinkId:
         paymentLink.paymentLinkId,

         checkoutUrl:
         paymentLink.checkoutUrl,

         qrCode:
         paymentLink.qrCode,

         status:"PENDING",

         createdAt:
         Date.now(),

         expiredAt:
         expiredAt * 1000

      };

      /* SAVE FIREBASE */

      await db
      .ref(
         `payments/${userId}/${orderCode}`
      )
      .set(paymentData);

      return res.json({

         success:true,

         qrCode:
         paymentLink.qrCode,

         checkoutUrl:
         paymentLink.checkoutUrl,

         paymentLinkId:
         paymentLink.paymentLinkId,

         description,

         bankName:"MB Bank",

         accountName:
         "NGUYEN TANG HOANG",

         accountNumber:
         "703062010"

      });

   }catch(err){

      console.log(err);

      return res.status(500).json({

         success:false,

         error:
         err.message || "Lỗi server"

      });

   }

}

