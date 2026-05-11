import admin from "firebase-admin";

/* FIREBASE ADMIN */

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

export default async function handler(req, res){

   try{

      const { userId } = req.query;

      if(!userId){

         return res.status(400).json([]);

      }

      /* GET FIREBASE */

      const snapshot =
      await db
      .ref(`payments/${userId}`)
      .once("value");

      if(!snapshot.exists()){

         return res.json([]);

      }

      const raw =
      snapshot.val();

      /* OBJECT -> ARRAY */

      const payments =
      Object.values(raw)

      .sort((a,b)=>

         b.createdAt - a.createdAt

      );

      return res.json(payments);

   }catch(err){

      console.log(err);

      return res.status(500).json([]);

   }

}
