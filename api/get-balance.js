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

export default async function handler(req, res){

   try{

      const { userId } =
      req.query;

      if(!userId){

         return res.json({

            balance:0

         });

      }

      const snapshot =
      await db
      .ref(`users/${userId}`)
      .once("value");

      if(!snapshot.exists()){

         return res.json({

            balance:0

         });

      }

      return res.json({

         balance:
         snapshot.val().balance || 0

      });

   }catch(err){

      console.log(err);

      return res.json({

         balance:0

      });

   }

}
