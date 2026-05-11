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

export default async function handler(req,res){

   try{

      const { paymentLinkId } =
      req.query;

      const snap =
      await db.ref(
         `payments/${paymentLinkId}`
      ).once("value");

      const data = snap.val();

      return res.json({

         paid:
         data?.paid === true

      });

   }catch(err){

      console.log(err);

      return res.json({
         paid:false
      });

   }

}
