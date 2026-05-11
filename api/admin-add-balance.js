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

export default async function handler(req, res){

   // CHỈ CHO POST
   if(req.method !== "POST"){

      return res.status(405).json({

         success:false,
         message:"Method not allowed"

      });

   }

   try{

      const {

         adminId,
         targetId,
         amount

      } = req.body;

      // CHECK INPUT
      if(
         !adminId ||
         !targetId ||
         !amount
      ){

         return res.json({

            success:false,
            message:"Thiếu dữ liệu"

         });

      }

      // CHECK ADMIN
      const adminSnap =
      await db
      .ref("users/" + adminId)
      .once("value");

      if(
         !adminSnap.exists() ||
         adminSnap.val().isAdmin !== true
      ){

         return res.json({

            success:false,
            message:"Không phải admin"

         });

      }

      // USER
      const userRef =
      db.ref("users/" + targetId);

      const userSnap =
      await userRef.once("value");

      if(!userSnap.exists()){

         return res.json({

            success:false,
            message:"User không tồn tại"

         });

      }

      const userData =
      userSnap.val();

      const oldBalance =
      Number(userData.balance || 0);

      const add =
      Number(amount);

      // CHẶN ÂM
      if(add <= 0){

         return res.json({

            success:false,
            message:"Số tiền không hợp lệ"

         });

      }

      const newBalance =
      oldBalance + add;

      // UPDATE BALANCE
      await userRef.update({

         balance:newBalance

      });

      // SAVE LOG
      await db.ref("balanceLogs").push({

         type:"admin_add",

         adminId,

         targetId,

         amount:add,

         oldBalance,

         newBalance,

         time:Date.now()

      });

      return res.json({

         success:true

      });

   }catch(err){

      console.log(err);

      return res.json({

         success:false,
         message:"Server error"

      });

   }

}
