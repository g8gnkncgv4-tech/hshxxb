export default async function handler(req,res){

   try{

      if(req.method !== "POST"){

         return res.status(405).json({
            success:false,
            message:"Method not allowed"
         });

      }

      const {

         adminId,
         userId,
         text

      } = req.body;

      if(!adminId){

         return res.status(400).json({
            success:false,
            message:"Thiếu adminId"
         });

      }

      if(!userId){

         return res.status(400).json({
            success:false,
            message:"Thiếu userId"
         });

      }

      if(!text){

         return res.status(400).json({
            success:false,
            message:"Thiếu nội dung"
         });

      }

      // CHECK ADMIN

      const check =
      await fetch(

         `${req.headers.origin}/api/check-admin?userId=${adminId}`

      );

      const checkData =
      await check.json();

      if(!checkData.isAdmin){

         return res.status(403).json({

            success:false,
            message:"Không có quyền"

         });

      }

      // SEND TELEGRAM

      const BOT_TOKEN =
      process.env.BOT_TOKEN;

      const tgRes =
      await fetch(

         `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,

         {

            method:"POST",

            headers:{
               "Content-Type":"application/json"
            },

            body:JSON.stringify({

               chat_id:userId,

               text:text

            })

         }

      );

      const tgData =
      await tgRes.json();

      if(!tgData.ok){

         return res.status(500).json({

            success:false,
            message:
            tgData.description ||
            "Telegram lỗi"

         });

      }

      return res.status(200).json({

         success:true

      });

   }catch(err){

      console.log(err);

      return res.status(500).json({

         success:false,
         message:err.message

      });

   }

}
