export default async function handler(req,res){

  try{
    
   const ADMIN_IDS =
   process.env.ADMIN_IDS
   .split(",")
   .map(Number);

   const userId =
   Number(req.query.userId);

   res.json({
      isAdmin:
      ADMIN_IDS.includes(userId)
   });


   }catch(err){

      res.status(500).json({
         success:false
      });

   }

}
