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

export default async function handler(req,res){

   try{

      console.log("METHOD:", req.method);

      console.log("BODY:", req.body);

      const userId =
      req.body?.userId;

      console.log("USER ID:", userId);

      if(!userId){

         return res.json({
            success:false,
            message:"Không có userId"
         });

      }

      await db
      .ref(`payments/${userId}`)
      .remove();

      console.log("ĐÃ XOÁ:", userId);

      return res.json({
         success:true
      });

   }catch(err){

      console.log("ERROR:", err);

      return res.json({
         success:false,
         error:String(err)
      });

   }

}
