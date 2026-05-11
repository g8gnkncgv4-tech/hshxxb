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

const db =
admin.database();

export default async function handler(req,res){

   try{

      if(req.method !== "POST"){

         return res.status(405).json({

            success:false

         });

      }

      const {

         adminId,
         text

      } = req.body;

      if(!adminId){

         return res.status(400).json({

            success:false,
            message:"Thiếu adminId"

         });

      }

      if(!text){

         return res.status(400).json({

            success:false,
            message:"Thiếu nội dung"

         });

      }

      // CHECK ADMIN

      const adminSnap =
      await db
      .ref("users/" + adminId)
      .once("value");

      const adminData =
      adminSnap.val();

      if(!adminData?.isAdmin){

         return res.status(403).json({

            success:false,
            message:"Không có quyền"

         });

      }

      // GET USERS

      const usersSnap =
      await db
      .ref("users")
      .once("value");

      const users =
      usersSnap.val() || {};

      const BOT_TOKEN =
      process.env.BOT_TOKEN;

      let sent = 0;
      let failed = 0;

      for(const uid in users){

         try{

            await fetch(

               `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,

               {

                  method:"POST",

                  headers:{
                     "Content-Type":"application/json"
                  },

                  body:JSON.stringify({

                     chat_id:uid,

                     text:text

                  })

               }

            );

            sent++;

         }catch(err){

            failed++;

         }

      }

      return res.status(200).json({

         success:true,
         sent,
         failed

      });

   }catch(err){

      console.log(err);

      return res.status(500).json({

         success:false,
         message:err.message

      });

   }

}
