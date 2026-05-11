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

      const {
         userId,
         amount,
         productId,
         packageId
      } = req.body;

      /* USER */

      const userRef =
      db.ref(`users/${userId}`);

      const userSnap =
      await userRef.once("value");

      if(!userSnap.exists()){

         return res.json({

            success:false,

            message:
            "Không tìm thấy user"

         });

      }

      const user =
      userSnap.val();

      const balance =
      Number(user.balance || 0);

      /* CHECK MONEY */

      if(balance < amount){

         return res.json({

            success:false,

            message:
            "Không đủ tiền"

         });

      }
const productRef =
   db.ref(`products/${productId}`);

const productSnap =
   await productRef.once("value");

if(!productSnap.exists()){

   return res.json({

      success:false,

      message:
      "Không tìm thấy sản phẩm"

   });

}
      /* PRODUCT */

      const packageRef =
      db.ref(
         `products/${productId}/packages/${packageId}`
      );

      const packageSnap =
      await packageRef.once("value");

      if(!packageSnap.exists()){

         return res.json({

            success:false,

            message:
            "Không tìm thấy gói"

         });

      }

      const item =
      packageSnap.val();

      const downloadUrl =
item.download &&
item.download.trim()
? item.download
: "https://t.me/hole30601";
      
      const p =
      productSnap.val();
      /* CHECK KEY */

      if(
         !item.keys ||
         item.keys.length <= 0
      ){

         return res.json({

            success:false,

            message:
            "Gói đã hết key"

         });

      }

      /* GET KEY */

      const key =
      item.keys[0];

      /* REMOVE KEY */

      item.keys.shift();

      /* NEW STOCK */

      const newStock =
      item.keys.length;

      /* UPDATE PACKAGE */

      await packageRef.update({

         keys:item.keys,

         stock:newStock

      });

      /* UPDATE BALANCE */

      await userRef.update({

         balance:
         balance - amount

      });

      /* SAVE ORDER */

      await db.ref("orders").push({

         userId,

         productId,

         packageId,

         key,

         amount,

         time:Date.now()

      });

      /* TELEGRAM */

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

`<b>Thông Báo</b>

${p.name} - ${item.brand} • ${item.name}

Bạn Đã Mua Thành Công ✅

<code>${key}</code>

Bấm nút bên dưới để tải xuống`,

         parse_mode:"HTML",

         reply_markup:{

            inline_keyboard:[

               [

                  {

                     text:"📥 Download",

                     url:downloadUrl

                  }

               ]

            ]

         }

      })

   }

);

      return res.json({

         success:true,

         key,

         stock:newStock

      });

   }catch(err){

      console.log(err);

      return res.json({

         success:false,

         message:
         "Có lỗi xảy ra"

      });

   }

}
