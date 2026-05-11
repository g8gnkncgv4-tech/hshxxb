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
         .replace(/\\n/g, "\n")

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

export default async function handler(req,res){

   try{

      const { paymentLinkId } = req.body;

      if(!paymentLinkId){

         return res.status(400).json({

            success:false,

            error:"Thiếu paymentLinkId"

         });

      }

      /* HUỶ PAYOS */

      await payOS.cancelPaymentLink(

         paymentLinkId,

         "Khách huỷ thanh toán"

      );

      /* TÌM PAYMENT TRONG FIREBASE */

      const snapshot =
      await db.ref("payments").once("value");

      const payments =
      snapshot.val() || {};

      for(const userId in payments){

         for(const orderCode in payments[userId]){

            const item =
            payments[userId][orderCode];

            if(
               item.paymentLinkId ===
               paymentLinkId
            ){

               await db
               .ref(
                  `payments/${userId}/${orderCode}`
               )
               .update({

                  status:"CANCELLED",

                  cancelledAt:
                  Date.now()

               });

            }

         }

      }

      return res.json({

         success:true

      });

   }catch(err){

      console.log(
         "CANCEL ERROR:",
         err
      );

      return res.status(500).json({

         success:false,

         error:
         err.message || "Lỗi server"

      });

   }

}
