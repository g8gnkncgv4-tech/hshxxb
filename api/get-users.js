import admin from "firebase-admin";

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

      const snap =
      await db
      .ref("users")
      .once("value");

      const val =
      snap.val() || {};

      let arr = [];

      Object.keys(val).forEach(uid=>{

         arr.push({

            userId: uid,

            username:
            val[uid].username || "unknown",

            balance:
            val[uid].balance || 0,

            isAdmin:
            val[uid].isAdmin || false

         });

      });

      arr.sort((a,b)=>{

         if(a.isAdmin && !b.isAdmin){
            return -1;
         }

         if(!a.isAdmin && b.isAdmin){
            return 1;
         }

         return 0;

      });

      res.status(200).json(arr);

   }catch(err){

      console.log(err);

      res.status(500).json({

         success:false,
         message:err.message

      });

   }

}
