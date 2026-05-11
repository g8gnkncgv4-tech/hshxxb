import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update,
  set,
  get
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
/* FIREBASE */

const firebaseConfig = {
  databaseURL:
  "https://jshb-45bce-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

/* TELEGRAM */

const tg = window.Telegram.WebApp;

tg.expand();
tg.ready();

/* USER */

const user = tg.initDataUnsafe?.user;

/* CHẶN NGOÀI TELEGRAM */

if(
  !user ||
  !user.id
){
  window.location.href = "./blocked.html";
}

/* SAVE USER */

(async()=>{

   try{

      const userRef =
      ref(db, "users/" + user.id);

      const snap =
      await get(userRef);

      // CHƯA TỒN TẠI
      if(!snap.exists()){

         await set(userRef, {

            username:
            user.username || "unknown",

            balance: 0,

            isAdmin:false,

            banned:false

         });

      }

      // ĐÃ TỒN TẠI
      else{

         await update(userRef, {

            username:
            user.username || "unknown"

         });

      }

   }catch(err){

      console.log(err);

   }

})();

(async()=>{

   try{

      const snap =
      await get(
         ref(db, "users/" + user.id)
      );

      const data =
      snap.val();

      if(data?.banned){

         document.body.innerHTML = `
            <div style="
               height:100vh;
               display:flex;
               align-items:center;
               justify-content:center;
               background:#0f172a;
               color:#fff;
               font-size:22px;
               font-weight:800;
               text-align:center;
               padding:20px;
            ">
               Tài khoản của bạn đã bị cấm
            </div>
         `;

         return;

      }

   }catch(err){

      console.log(err);

   }

})();
/* USER INFO */

document.getElementById("fullname").innerText =
`${user.first_name || ""} ${user.last_name || ""}`;

document.getElementById("username").innerText =
user.username;

document.getElementById("userid").innerText =
user.id;

/* AVATAR */

const first =
user.first_name
? user.first_name[0]
: "U";

const second =
user.last_name
? user.last_name[0]
: "";

document.getElementById("avatarText").innerText =
(first + second).toUpperCase();

/* ADMIN */

let isAdmin = false;

async function checkAdmin(){

   try{

      const res =
      await fetch(
         `../api/check-admin?userId=${user.id}`
      );

      const data =
      await res.json();

      isAdmin =
      data.isAdmin === true;

      if(isAdmin){

         document.getElementById(
            "adminPanel"
         ).style.display = "block";

      }

   }catch(err){

      console.log(err);

   }

}






  function hideAllPages() {

  document.getElementById("homeTitle").style.display = "none";

  document.getElementById("searchBar").style.display = "none";

  document.getElementById("products").style.display = "none";

  document.getElementById("refreshBtn").style.display = "none";

  /* THÊM 2 DÒNG NÀY */

  document.getElementById("packagePage").style.display = "none";

  document.getElementById("detailPage").style.display = "none";

  document.getElementById("pageContainer").innerHTML = "";

  if(isAdmin){

    document.getElementById("adminPanel")
    .style.display = "none";

  }

}


window.showHome = function () {

  hideAllPages();

  document.getElementById("homeTitle").style.display = "block";

  document.getElementById("searchBar").style.display = "flex";

  document.getElementById("products").style.display = "flex";

  document.getElementById("refreshBtn").style.display = "block";

  renderProducts();

};
window.showDeposit = async function () {

  hideAllPages();
  
  
  const html = `
    <div class="title">Nạp tiền</div>

    <div class="depositTabs">
      <div class="tab active" onclick="switchTab(0)">
        Chuyển khoản
      </div>

      <div class="tab" onclick="switchTab(1)">
        Thẻ cào
      </div>
    </div>

    <div id="tabContent">
      ${renderBank()}
    </div>



  `;

  document.getElementById("pageContainer").innerHTML = html;   
};

window.showLichsu = async function () {

  hideAllPages();

  const html = `

 <div class="title">
      Lịch sử đơn hàng
    </div>

    <div id="orderHistoryList">

      <div style="
        padding:20px;
        text-align:center;
        color:#9aa4d3;
      ">
        Đang tải lịch sử đơn...
      </div>

    </div>

  `;

 document.getElementById(
    "pageContainer"
  ).innerHTML = html; 
renderOrderHistory();

};

/* =========================
   PROFILE NEW
========================= */

window.showProfile = async function(){

   hideAllPages();

   const html = `

      <div style="
         font-size:24px;
         font-weight:800;
         margin-bottom:4px;
      ">
         Profile
      </div>

      <div style="
         color:#8f9ac8;
         font-size:13px;
         margin-bottom:16px;
      ">
         @${user.username || "unknown"} • ${user.id}
      </div>

      <div style="
         background:#11193d;
         border-radius:18px;
         padding:14px;
         border:1px solid rgba(255,255,255,.06);
      ">

         <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:14px;
         ">

            <div style="
               font-size:14px;
               font-weight:700;
            ">
               Số dư
            </div>

            <div
               id="profileBalance"
               style="
                  color:#7b63ff;
                  font-size:18px;
                  font-weight:800;
               "
            >
               Đang tải...
            </div>

         </div>

         <div style="
            display:flex;
            gap:8px;
         ">

            <button
               onclick="showDeposit()"
               style="
                  flex:1;
                  height:42px;
                  border:none;
                  border-radius:12px;
                  background:#7b63ff;
                  color:#fff;
                  font-size:13px;
                  font-weight:700;
               "
            >
               Nạp Tiền
            </button>

            <button
               onclick="showLichsu()"
               style="
                  flex:1;
                  height:42px;
                  border:none;
                  border-radius:12px;
                  background:#202744;
                  color:#fff;
                  font-size:13px;
                  font-weight:700;
               "
            >
               Lịch sử
            </button>

            <button
               onclick="closeMiniApp()"
               style="
                  flex:1;
                  height:42px;
                  border:none;
                  border-radius:12px;
                  background:#ff4d4f;
                  color:#fff;
                  font-size:13px;
                  font-weight:700;
               "
            >
               Đóng
            </button>

         </div>

      </div>

      <div style="
         margin-top:12px;
         background:#11193d;
         border-radius:16px;
         padding:12px;
         color:#98a4d8;
         font-size:12px;
         line-height:1.5;
      ">
         Lịch sử giao dịch và số dư được liên kết theo tài khoản Telegram của bạn.
      </div>

      ${
         isAdmin
         ?
         `
         <div style="
            margin-top:16px;
            background:#11193d;
            border-radius:18px;
            padding:14px;
         ">

            <div style="
               font-size:16px;
               font-weight:800;
               margin-bottom:12px;
            ">
               Quản lý Admin
            </div>

            <button
               onclick="showMembersManager()"
               style="
                  width:100%;
                  height:44px;
                  border:none;
                  border-radius:12px;
                  background:#7b63ff;
                  color:white;
                  font-size:13px;
                  font-weight:700;
               "
            >
               Danh sách member
            </button>

         </div>
         `
         :
         ""
      }

   `;

   document.getElementById(
      "pageContainer"
   ).innerHTML = html;

   /* LOAD BALANCE SAU -> HẾT DELAY */

   fetch(`/api/get-balance?userId=${user.id}`)
   .then(r=>r.json())
   .then(data=>{

      const el =
      document.getElementById(
         "profileBalance"
      );

      if(!el) return;

      el.innerText =
      Number(data.balance || 0)
      .toLocaleString("vi-VN") + "đ";

   })
   .catch(()=>{

      const el =
      document.getElementById(
         "profileBalance"
      );

      if(el){
         el.innerText = "0đ";
      }

   });

};



/* =========================
   MEMBERS MANAGER
========================= */

window.showMembersManager = async function(){

   hideAllPages();

   document.getElementById(
      "pageContainer"
   ).innerHTML = `
      <div style="
         padding:20px;
         text-align:center;
         color:#9aa4d3;
      ">
         Đang tải member...
      </div>
   `;

   try{

      const res =
      await fetch("../api/get-users");

      const data =
      await res.json();

      let admins = [];
      let members = [];

      data.forEach(u=>{

         if(u.isAdmin){

            admins.push(u);

         }else{

            members.push(u);

         }

      });

      let html = `

         <button
            onclick="showProfile()"
            style="
               margin-bottom:18px;
               height:42px;
               padding:0 18px;
               border:none;
               border-radius:12px;
               background:#11193d;
               color:white;
               font-weight:700;
            "
         >
            ← Quay lại
         </button>

         <div style="
            font-size:24px;
            font-weight:800;
            margin-bottom:18px;
         ">
            Danh sách member
         </div>

         <button
            onclick="sendAllUsersMessage()"
            style="
               width:100%;
               height:44px;
               border:none;
               border-radius:14px;
               background:#ff9800;
               color:white;
               font-size:13px;
               font-weight:700;
               margin-bottom:18px;
            "
         >
            Gửi thông báo tất cả member
         </button>

      `;

      if(admins.length){

         admins.forEach(u=>{

            html += `

               <div
                  onclick="openMemberActions('${u.userId}','${u.username || "unknown"}')"
                  style="
                     background:#11193d;
                     padding:14px;
                     border-radius:16px;
                     margin-bottom:10px;
                     display:flex;
                     justify-content:space-between;
                     align-items:center;
                  "
               >

                  <div>

                     <div style="
                        font-size:14px;
                        font-weight:700;
                     ">
                        ${u.username || "unknown"} • ${u.userId}
                     </div>

                     <div style="
                        margin-top:5px;
                        font-size:11px;
                        color:#ffb347;
                     ">
                        ADMIN
                     </div>

                  </div>

                  <div style="
                     font-size:18px;
                     color:#7b63ff;
                  ">
                     ›
                  </div>

               </div>

            `;

         });

      }

      if(members.length){

         members.forEach(u=>{

            html += `

               <div
                  onclick="openMemberActions('${u.userId}','${u.username || "unknown"}')"
                  style="
                     background:#11193d;
                     padding:14px;
                     border-radius:16px;
                     margin-bottom:10px;
                     display:flex;
                     justify-content:space-between;
                     align-items:center;
                  "
               >

                  <div style="
                     font-size:14px;
                     font-weight:700;
                  ">
                     ${u.username || "unknown"} • ${u.userId}
                  </div>

                  <div style="
                     font-size:18px;
                     color:#7b63ff;
                  ">
                     ›
                  </div>

               </div>

            `;

         });

      }

      document.getElementById(
         "pageContainer"
      ).innerHTML = html;

   }catch(err){

      console.log(err);

      alert("Không tải được member");

   }

};



/* =========================
   MEMBER ACTIONS
========================= */
window.openMemberActions = async function(uid, username){

   try{

      const snap =
      await get(
         ref(db, "users/" + uid)
      );

      const data =
      snap.val() || {};

      const banned =
      data.banned === true;

      const isTargetAdmin =
      data.isAdmin === true;

      const html = `

         <button
            onclick="showMembersManager()"
            style="
               margin-bottom:18px;
               height:42px;
               padding:0 18px;
               border:none;
               border-radius:12px;
               background:#11193d;
               color:white;
               font-weight:700;
            "
         >
            ← Quay lại
         </button>

         <div style="
            font-size:22px;
            font-weight:800;
         ">
            ${username}
         </div>

         <div style="
            color:#9aa4d3;
            margin-top:6px;
            margin-bottom:20px;
         ">
            ${uid}
         </div>

         ${
            isTargetAdmin
            ?
            `
            <div style="
               background:#2a1f12;
               color:#ffb347;
               padding:12px;
               border-radius:14px;
               margin-bottom:14px;
               font-size:13px;
               font-weight:700;
            ">
               Đây là admin
            </div>
            `
            :
            ""
         }

         <div style="
            display:flex;
            flex-direction:column;
            gap:12px;
         ">

            <button
               onclick="adminAddMoneyTo('${uid}')"
               style="
                  height:46px;
                  border:none;
                  border-radius:14px;
                  background:#1fa971;
                  color:white;
                  font-weight:700;
               "
            >
               + Cộng tiền
            </button>

            ${
               !isTargetAdmin
               ?
               `
               <button
                  onclick="banMember('${uid}')"
                  style="
                     height:46px;
                     border:none;
                     border-radius:14px;
                     background:${
                        banned
                        ? "#ffb347"
                        : "#ff4d4f"
                     };
                     color:white;
                     font-weight:700;
                  "
               >
                  ${
                     banned
                     ? "Unban"
                     : "Ban ID"
                  }
               </button>
               `
               :
               ""
            }

            <button
               onclick="sendUserMessage('${uid}')"
               style="
                  height:46px;
                  border:none;
                  border-radius:14px;
                  background:#7b63ff;
                  color:white;
                  font-weight:700;
               "
            >
               Gửi tin nhắn
            </button>

         </div>

      `;

      document.getElementById(
         "pageContainer"
      ).innerHTML = html;

   }catch(err){

      console.log(err);

   }

};



/* =========================
   ADD MONEY
========================= */

window.adminAddMoneyTo = async function(uid){

   const amount =
   prompt("Nhập số tiền");

   if(!amount) return;

   try{

      const res =
      await fetch(
         "../api/admin-add-balance",
         {
            method:"POST",
            headers:{
               "Content-Type":"application/json"
            },
            body:JSON.stringify({
               adminId:user.id,
               targetId:uid,
               amount:Number(amount)
            })
         }
      );

      const data =
      await res.json();

      if(data.success){

         alert("Đã cộng tiền");

      }else{

         alert(data.message || "Thất bại");

      }

   }catch(err){

      console.log(err);

   }

};



/* =========================
   SEND MESSAGE USER
========================= */

window.sendUserMessage = async function(uid){

   const text =
   prompt(
`Nhập nội dung tin nhắn

Có thể xuống dòng`
   );

   if(!text) return;

   try{

      const res =
      await fetch(
         "../api/send-user-message",
         {
            method:"POST",
            headers:{
               "Content-Type":"application/json"
            },
            body:JSON.stringify({
               adminId:user.id,
               userId:uid,
               text
            })
         }
      );

      const data =
      await res.json();

      if(data.success){

         alert("Đã gửi");

      }else{

         alert(data.message || "Gửi thất bại");

      }

   }catch(err){

      console.log(err);

   }

};



/* =========================
   SEND ALL
========================= */

window.sendAllUsersMessage = async function(){

   const text =
   prompt(
`Nhập thông báo gửi tất cả member`
   );

   if(!text) return;

   try{

      const res =
      await fetch(
         "../api/send-all-message",
         {
            method:"POST",
            headers:{
               "Content-Type":"application/json"
            },
            body:JSON.stringify({
               adminId:user.id,
               text
            })
         }
      );

      const data =
      await res.json();

      if(data.success){

         alert("Đã gửi tất cả");

      }else{

         alert(data.message || "Thất bại");

      }

   }catch(err){

      console.log(err);

   }

};



/* =========================
   BAN USER
========================= */
window.banMember = async function(uid){

   try{

      const userRef =
      ref(db, "users/" + uid);

      const snap =
      await get(userRef);

      if(!snap.exists()){

         return alert("User không tồn tại");

      }

      const data =
      snap.val();

      // KHÔNG CHO BAN ADMIN
      if(data.isAdmin){

         return alert(
            "Không thể ban admin"
         );

      }

      const banned =
      data.banned === true;

      // UNBAN
      if(banned){

         await update(userRef, {

            banned:false

         });

         alert("Đã unban");

      }

      // BAN
      else{

         await update(userRef, {

            banned:true

         });

         alert("Đã ban");

      }

      openMemberActions(
         uid,
         data.username || "unknown"
      );

   }catch(err){

      console.log(err);

      alert("Lỗi");

   }

};
document.addEventListener("click", function (e) {
   const el = e.target;

   if (el.tagName === "BUTTON" || el.closest("button")) {
      if (navigator.vibrate) {
         navigator.vibrate(8);
      }
   }
});

window.setActiveNav = function (index) {
  const btns = document.querySelectorAll(".navBtn");

  btns.forEach(b => b.classList.remove("active"));
  btns[index].classList.add("active");
};

window.switchTab = function (index) {
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach(t => t.classList.remove("active"));
  tabs[index].classList.add("active");

  const content = document.getElementById("tabContent");

  content.innerHTML = index === 0 ? renderBank() : renderCard();
};



function renderBank(){

   setTimeout(()=>{
      loadHistory();
   },0);

   return `

      <div class="depositCard">

         <div class="label">
            Số tiền cần nạp (VND)
         </div>

         <div class="inputRow">

            <input
               class="moneyInput"
               id="moneyInput"
               placeholder="VD: 100000"
            >

            <button
               class="qrBtn"
               onclick="goQR()"
            >
               Tạo QR
            </button>

         </div>

         <div class="note">
            Tối thiểu 2.000đ.
            CK đúng nội dung để tự động cộng tiền.
         </div>

      </div>

      <div class="bankCard">

         <div class="bankRow">
            <span>Ngân hàng</span>
            <b>MB</b>
         </div>

         <div class="bankRow">
            <span>STK</span>
            <b>703062010</b>
         </div>

         <div class="bankRow">
            <span>Chủ TK</span>
            <b>NGUYEN TANG HOANG</b>
         </div>

      </div>

      <div class="historyCard">

         <div class="historyTitle">
            Lịch sử giao dịch
         </div>

         <div id="historyList">

            <div style="
               padding:20px;
               text-align:center;
               color:#9aa4d3;
            ">
               Đang tải lịch sử...
            </div>

         </div>

         <button
            class="clearHistoryBtn"
            onclick="clearAllHistory()"
         >
            Xoá toàn bộ lịch sử
         </button>

      </div>

   `;

}
function renderCard() {
  return `
    <div class="depositBox">
      <input placeholder="Mã thẻ">
      <input placeholder="Serial">
      <button>Nạp thẻ</button>
    </div>
  `;
}



      

window.goQR = function(){

  const amount =
    document.querySelector(".moneyInput").value;

  if(!amount || amount < 2000){
    alert("Nhập tối thiểu 2.000đ");
    return;
  }

  window.location.href =
    `/deposit/deposit.html?amount=${amount}`;

}
  
function hideMainUI(){

  document.getElementById("products").style.display = "none";

  document.getElementById("searchBar").style.display = "none";

  document.getElementById("refreshBtn").style.display = "none";

  if(isAdmin){

    document.getElementById("adminPanel")
    .style.display = "none";

  }

}

function showMainUI(){

  document.getElementById("products").style.display = "flex";

  document.getElementById("searchBar").style.display = "flex";

  document.getElementById("refreshBtn").style.display = "block";

  if(isAdmin){

    document.getElementById("adminPanel")
    .style.display = "block";

  }

}
async function loadBalance(){

   try{

      const res =
      await fetch(
         `/api/get-balance?userId=${user.id}`
      );

      const data =
      await res.json();

      const el =
      document.querySelector(
         ".balance"
      );

      if(!el) return;

      el.innerHTML =
      `Số dư&nbsp; ${
         Number(data.balance || 0)
         .toLocaleString("vi-VN")
      } đ`;

   }catch(err){

      console.log(err);

   }

}


/* PRODUCTS */

let products = [];

/* FIREBASE */

const productsRef = ref(db, "products");

/* LOAD */

onValue(productsRef, (snapshot)=>{

  products = [];

  if(snapshot.exists()){

    snapshot.forEach((child)=>{

      products.push({
        id: child.key,
        ...child.val()
      });

    });

  }

  // đang ở detail
  if(currentProductId && currentPackageId){

    openDetail(
      currentProductId,
      currentPackageId
    );

    return;
  }

  // đang ở package
  if(currentProductId){

    openPackages(currentProductId);

    return;
  }

  // home
  renderProducts(products);

});

let currentProductId = null;
let currentPackageId = null;

/* HOME */

window.renderProducts = function(data = products){

 currentProductId = null;
 currentPackageId = null;
  showMainUI();

  document.getElementById("packagePage").style.display = "none";

  document.getElementById("detailPage").style.display = "none"; 

  const container =
  document.getElementById("products");

  container.style.display = "flex";

  container.innerHTML = "";

  if(data.length === 0){

    container.innerHTML = `
      <div style="
        color:#9aa4d3;
        text-align:center;
        padding:30px;
      ">
        Không có sản phẩm
      </div>
    `;

    return;

  }

  data.forEach((p)=>{

    container.innerHTML += `

      <div class="product">

        <div class="productLeft">

          <img src="${p.image}">

          <div class="productInfo">

            <div class="productName">
              ${p.name}
            </div>

            <div class="productType">
              ${p.type || ""}
            </div>

          </div>

        </div>

        <div style="display:flex;gap:8px">

          ${isAdmin ? `
<button
  onclick="editProduct('${p.id}')"
  style="
    width:40px;
    height:40px;
    border:none;
    border-radius:12px;
    background:#ffa500;
    color:white;
  "
>
  <i class="fa-solid fa-pen"></i>
</button>
            <button
              onclick="deleteProduct('${p.id}')"
              style="
                width:40px;
                height:40px;
                border:none;
                border-radius:12px;
                background:#ff4d4f;
                color:white;
              "
            >
              <i class="fa-solid fa-trash"></i>
            </button>

          ` : ``}

          <button
            class="chooseBtn"
            onclick="openPackages('${p.id}')"
          >
            Chọn
          </button>

        </div>

        <div id="modalOverlay1">
  <div id="modalBox1"></div>
</div>

      </div>

    `;

  });

}

let historyCache = null;

/* =========================
   LỊCH SỬ ĐƠN
========================= */

let orderHistoryCache = [];

function saveOrderHistory(item){

   try{

      const uid =
      user?.id || "guest";

      orderHistoryCache.unshift(item);

      // giới hạn 50 đơn
      if(orderHistoryCache.length > 50){

         orderHistoryCache =
         orderHistoryCache.slice(0,50);

      }

      localStorage.setItem(
         "orderHistory_" + uid,
         JSON.stringify(orderHistoryCache)
      );

   }catch(err){

      console.log(
         "SAVE HISTORY ERROR:",
         err
      );

   }

}

function loadOrderHistoryData(){

   try{

      const uid =
      user?.id || "guest";

      const raw =
      localStorage.getItem(
         "orderHistory_" + uid
      );

      orderHistoryCache =
      raw ? JSON.parse(raw) : [];

   }catch(err){

      console.log(err);

      orderHistoryCache = [];

   }

}

function renderOrderHistory(){

   const list =
   document.getElementById(
      "orderHistoryList"
   );

   if(!list) return;

   loadOrderHistoryData();

   if(!orderHistoryCache.length){

      list.innerHTML = `
         <div style="
            padding:24px;
            text-align:center;
            color:#9aa4d3;
            background:#11193d;
            border-radius:18px;
         ">
            Chưa có lịch sử đơn
         </div>
      `;

      return;

   }

   let html = "";

   orderHistoryCache.forEach((item,index)=>{

      let buttons = "";

      if(item.needPay){

         buttons = `

            <div class="historyBtns">

               <button
                  class="historyBtn copyBtn"
                  onclick="copyHistoryText('${item.content}')"
               >
                  Copy ND
               </button>

               <button
                  class="historyBtn qrBtn2"
                  onclick="window.location.href='/deposit/deposit.html?amount=${item.amount}'"
               >
                  Mở QR
               </button>

               <button
                  class="historyBtn cancelBtn2"
                  onclick="deleteOneOrder(${index})"
               >
                  Huỷ
               </button>

            </div>

         `;

      }

      html += `

         <div class="historyItem">

            <div class="historyTop">

               <div>

                  <div class="historyCode">
                     ${item.product}
                  </div>

                  <div class="historyType">
                     ${item.type}
                  </div>

               </div>

               <div class="status ${
   item.needPay &&
   Date.now() > item.expiredAt
   ? "expired"
   : item.statusClass
}">
   ${
      item.needPay &&
      Date.now() > item.expiredAt
      ? "Hết hạn"
      : item.status
   }
</div>

            </div>

            <div class="historyInfo">

               <div class="historyRow">

                  <span>Số tiền</span>

                  <b>
                     ${Number(item.amount)
                     .toLocaleString("vi-VN")} đ
                  </b>

               </div>

               ${item.content ? `

               <div class="historyRow">

                  <span>Nội dung Sản phẩm</span>

                  <b>
                     ${item.content}
                  </b>

               </div>

               ` : ""}

            </div>

            ${buttons}

         </div>

      `;

   });

   html += `

      <button
         onclick="clearOrderHistory()"
         style="
            margin-top:16px;
            width:100px;
            height:42px;
            border-radius:14px;
            background:#000;
            color:#fff;
            border:1px solid #fff;
            font-weight:700;
            display:flex;
            align-items:center;
            justify-content:center;
         "
      >
         Xoá tất cả
      </button>

   `;

   list.innerHTML = html;

}

window.clearOrderHistory = function(){

   const ok =
   confirm(
      "Chỉ xoá đơn chưa thanh toán và đã hết hạn?"
   );

   if(!ok) return;

   orderHistoryCache =
   orderHistoryCache.filter(item=>{

      // giữ lại đơn đã thanh toán
      if(!item.needPay){

         return true;

      }

      // giữ lại đơn chưa hết hạn
      if(Date.now() < item.expiredAt){

         return true;

      }

      // còn lại => xoá
      return false;

   });

   localStorage.setItem(

      "orderHistory_" + user.id,

      JSON.stringify(orderHistoryCache)

   );

   renderOrderHistory();

}

window.deleteOneOrder = function(index){

   orderHistoryCache.splice(index,1);

   localStorage.setItem(
      "orderHistory_" + user.id,
      JSON.stringify(orderHistoryCache)
   );

   renderOrderHistory();

}

async function loadHistory(){

   const list =
   document.getElementById("historyList");

   if(!list) return;

   // cache
   if(historyCache){

      renderHistory(historyCache);
      return;

   }

   list.innerHTML = `
      <div style="
         padding:20px;
         text-align:center;
         color:#9aa4d3;
      ">
         Đang tải lịch sử...
      </div>
   `;

   try{

      const res =
      await fetch(
         `/api/get-payments?userId=${user.id}`
      );

      const data =
      await res.json();

      historyCache =
      Array.isArray(data)
      ? data
      : [];

      renderHistory(historyCache);

   }catch(err){

      console.log(err);

      list.innerHTML = `
         <div style="
            padding:20px;
            text-align:center;
            color:#ff6b6b;
         ">
            Không tải được lịch sử
         </div>
      `;

   }

}

/* =========================
   RENDER HISTORY
========================= */

function renderHistory(data){

   const list =
   document.getElementById(
      "historyList"
   );

   if(!list) return;

   // API lỗi
   if(!Array.isArray(data)){

      list.innerHTML = `
         <div style="
            padding:20px;
            color:red;
            text-align:center;
         ">
            API không trả array
         </div>
      `;

      return;

   }

   // không có lịch sử
   if(!data.length){

      list.innerHTML = `
         <div style="
            padding:20px;
            text-align:center;
            color:#9aa4d3;
         ">
            Chưa có giao dịch
         </div>
      `;

      return;

   }

   let html = "";

   data.forEach((item)=>{

      let statusText = "Chờ";
      let statusClass = "pending";

      // PAID
      if(item.status === "PAID"){

         statusText = "Đã thanh toán";
         statusClass = "success";

      }

      // CANCELLED
      if(item.status === "CANCELLED"){

         statusText = "Đã huỷ";
         statusClass = "cancel";

      }

      // EXPIRED
      if(
         Date.now() > item.expiredAt &&
         item.status !== "PAID" &&
         item.status !== "CANCELLED"
      ){

         statusText = "Hết hạn";
         statusClass = "expired";

      }

      // nút huỷ
      let cancelBtn = "";

      if(
         item.status !== "PAID" &&
         item.status !== "CANCELLED" &&
         Date.now() < item.expiredAt
      ){

         cancelBtn = `
            <button
               class="historyBtn cancelBtn2"
               onclick="cancelOldPayment('${item.paymentLinkId}')"
               style="
                  transition:
                  transform .12s ease,
                  opacity .12s ease,
                  filter .12s ease;
               "

               onmouseover="
                  this.style.filter='brightness(1.08)'
               "

               onmouseout="
                  this.style.filter='brightness(1)';
                  this.style.transform='scale(1)';
                  this.style.opacity='1';
               "

               ontouchstart="
                  this.style.transform='scale(.96)';
                  this.style.opacity='.7';
                  this.style.filter='brightness(.8)';
               "

               ontouchend="
                  this.style.transform='scale(1)';
                  this.style.opacity='1';
                  this.style.filter='brightness(1.08)';
               "
            >
               Huỷ đơn
            </button>
         `;

      }

      html += `

         <div class="historyItem">

            <div class="historyTop">

               <div>

                  <div class="historyCode">
                     TOPUP${item.orderCode}
                  </div>

                  <div class="historyType">
                     Đơn VietQR (TOPUP)
                  </div>

               </div>

               <div class="status ${statusClass}">
                  ${statusText}
               </div>

            </div>

            <div class="historyInfo">

               <div class="historyRow">

                  <span>Số tiền</span>

                  <b>
                     ${Number(item.amount)
                     .toLocaleString("vi-VN")} đ
                  </b>

               </div>

               <div class="historyRow">

                  <span>Nội dung</span>

                  <b>
                     ${item.description}
                  </b>

               </div>

            </div>

            <div class="historyBtns">

               <button
                  class="historyBtn copyBtn"
                  onclick="copyHistoryText('${item.description}')"

                  style="
                     transition:
                     transform .12s ease,
                     opacity .12s ease,
                     filter .12s ease;
                  "

                  onmouseover="
                     this.style.filter='brightness(1.08)'
                  "

                  onmouseout="
                     this.style.filter='brightness(1)';
                     this.style.transform='scale(1)';
                     this.style.opacity='1';
                  "

                  ontouchstart="
                     this.style.transform='scale(.96)';
                     this.style.opacity='.7';
                     this.style.filter='brightness(.8)';
                  "

                  ontouchend="
                     this.style.transform='scale(1)';
                     this.style.opacity='1';
                     this.style.filter='brightness(1.08)';
                  "
               >
                  Copy ND
               </button>

               <button
                  class="historyBtn qrBtn2"
                  onclick="window.location.href='${item.checkoutUrl}'"

                  style="
                     transition:
                     transform .12s ease,
                     opacity .12s ease,
                     filter .12s ease;
                  "

                  onmouseover="
                     this.style.filter='brightness(1.08)'
                  "

                  onmouseout="
                     this.style.filter='brightness(1)';
                     this.style.transform='scale(1)';
                     this.style.opacity='1';
                  "

                  ontouchstart="
                     this.style.transform='scale(.96)';
                     this.style.opacity='.7';
                     this.style.filter='brightness(.8)';
                  "

                  ontouchend="
                     this.style.transform='scale(1)';
                     this.style.opacity='1';
                     this.style.filter='brightness(1.08)';
                  "
               >
                  Mở QR
               </button>

               ${cancelBtn}

            </div>

         </div>

      `;

   });

   // render 1 lần
   list.innerHTML = html;

}

/* =========================
   CLEAR HISTORY
========================= */

window.clearAllHistory = async function(){

   try{

      const ok =
      confirm(
         "Xoá toàn bộ lịch sử giao dịch?"
      );

      if(!ok) return;

      const res =
      await fetch(
         "../api/clear-payments",
         {

            method:"POST",

            headers:{
               "Content-Type":
               "application/json"
            },

            body:JSON.stringify({

               userId:user.id

            })

         }
      );

      const data =
      await res.json();

      if(data.success){

         alert("Đã xoá toàn bộ");

         // reset cache
         historyCache = null;

         loadHistory();

      }else{

         alert("Xoá thất bại");

      }

   }catch(err){

      console.log(err);

      alert("Có lỗi xảy ra");

   }

}

/* =========================
   CANCEL PAYMENT
========================= */

window.cancelOldPayment =
async function(paymentLinkId){

   try{

      const res =
      await fetch(
         "../api/cancel-payment",
         {

            method:"POST",

            headers:{
               "Content-Type":
               "application/json"
            },

            body:JSON.stringify({
               paymentLinkId
            })

         }
      );

      const data =
      await res.json();

      if(data.success){

         alert("Đã huỷ");

         // reset cache
         historyCache = null;

         loadHistory();

      }else{

         alert(
            data.error ||
            "Huỷ thất bại"
         );

      }

   }catch(err){

      console.log(err);

      alert("Lỗi");

   }

}
/*async function cancelOldPayment(paymentLinkId){*/

  
         


  window.copyHistoryText = async function(text){

   try{

      if(
         navigator.clipboard &&
         window.isSecureContext
      ){

         await navigator.clipboard
         .writeText(text);

      }else{

         const input =
         document.createElement("textarea");

         input.value = text;

         document.body.appendChild(input);

         input.select();

         document.execCommand("copy");

         input.remove();

      }

      if(
         window.Telegram &&
         Telegram.WebApp
      ){

         Telegram.WebApp.showAlert(
            "Đã copy"
         );

      }else{

         alert("Đã copy");

      }

   }catch(err){

      console.log(err);

   }

}

function openOldPayment(url){

   window.location.href = url;

};



/* OPEN PACKAGE PAGE */

window.openPackages = function(id){

   currentProductId = id;
 currentPackageId = null;
  
  const product =
  products.find(p=>p.id === id);

  if(!product) return;

  hideMainUI(); 

  document.getElementById("detailPage").style.display = "none";

  const page =
  document.getElementById("packagePage");

  page.style.display = "block";

  let html = `

    <button
      onclick="renderProducts()"
      style="
        margin-bottom:20px;
        height:50px;
        padding:0 20px;
        border:none;
        border-radius:16px;
        background:#11193d;
        color:white;
        font-weight:700;
      "
    >
      ← Quay lại
    </button>

    <div style="
      font-size:32px;
      font-weight:800;
      margin-bottom:20px;
    ">
      ${product.name}
    </div>

    <div style="
      background:#11193d;
      border-radius:24px;
      padding:18px;
      border:1px solid rgba(255,255,255,.07);
    ">

      <div style="
        font-size:20px;
        font-weight:800;
        margin-bottom:18px;
      ">
        Gói / Loại
      </div>

  `;

  if(product.packages){

    Object.keys(product.packages).forEach((key)=>{

      const item = product.packages[key];

      html += `

        <div style="
          background:#202744;
          border-radius:24px;
          padding:16px;
          margin-bottom:16px;
          display:flex;
          justify-content:space-between;
          gap:10px;
        ">

          <div style="
            display:flex;
            gap:10px;
          ">

            <img
              src="${product.image}"
              style="
                width:60px;
                height:60px;
                border-radius:14px;
                object-fit:cover;
              "
            >

            <div>

              <div style="
                font-size:15px;
                font-weight:800;
              ">
                ${item.name}
              </div>

              <div style="
                font-size:13px;
                font-weight:800;
                margin-top:5px;
              ">
                ${item.price}
              </div>

              <div style="
                display:flex;
                gap:8px;
                margin-top:10px;
                flex-wrap:wrap;
              ">

                <div style="
                  padding:6px 10px;
                  border-radius:999px;
                  background:#302b63;
                  color:white;
                  font-size:10px;
                ">
                  Hãng: ${item.brand}
                </div>

                <div style="
                  padding:6px 10px;
                  border-radius:999px;
                  border:1px solid #7e6b2b;
                  color:#ffcf66;
                  font-size:10px;
                ">
                  Tồn: ${item.stock}
                </div>

              </div>

            </div>

          </div>

          <div>

            ${isAdmin ? `
              <button
    onclick="editPackage('${product.id}','${key}')"
    style="
      width:40px;
      height:40px;
      border:none;
      border-radius:12px;
      background:#ffa500;
      color:white;
      margin-bottom:8px;
    "
  >
    <i class="fa-solid fa-pen"></i>
  </button>

            <button
              onclick="deletePackage('${product.id}','${key}')"
              style="
                width:40px;
                height:40px;
                border:none;
                border-radius:12px;
                background:red;
                color:white;
                margin-bottom:8px;
              "
            >
              <i class="fa-solid fa-trash"></i>
            </button>

            <br>

            ` : ``}

            <button
              class="chooseBtn"
              onclick="openDetail('${product.id}','${key}')"
            >
              Chọn
            </button>

          </div>
<div id="modalOverlay">
  <div id="modalBox"></div>
</div>
        </div>

      `;

    });

  }

  html += `</div>`;

  if(isAdmin){

    html += `

      <div style="
        margin-top:20px;
        background:#11193d;
        padding:20px;
        border-radius:20px;
      ">

        <div style="
          font-size:22px;
          font-weight:800;
          margin-bottom:16px;
        ">
          Thêm gói
        </div>

        <input id="pkgName" placeholder="Tên gói">
       <input
  id="pkgPrice"
  placeholder="Ví dụ: 100.000đ"
/>
        <input id="pkgBrand" placeholder="Hãng">

        <textarea
  id="pkgKeys"
  placeholder="Mỗi dòng là 1 key\n\nVD:\nNETFLIX-123\nNETFLIX-456\nNETFLIX-789"
  style="
    width:100%;
    height:140px;
    margin-top:12px;
    background:#1a2452;
    border:none;
    border-radius:14px;
    padding:14px;
    color:white;
  "
></textarea>

    

    <input
  id="pkgImage"
  type="url"
  placeholder="https://..."
/>

<input
  id="pkgDownload"
  type="url"
  placeholder="Link download / nhóm / file"
 />

        <textarea
          id="pkgDesc"
          placeholder="Chi tiết"
          style="
            width:100%;
            height:120px;
            margin-top:12px;
            background:#1a2452;
            border:none;
            border-radius:14px;
            padding:14px;
            color:white;
          "
        ></textarea>

        <button
          onclick="addPackage('${product.id}')"
          style="
            width:100%;
            height:50px;
            margin-top:14px;
            border:none;
            border-radius:14px;
            background:#7b63ff;
            color:white;
            font-weight:800;
    transition:
           transform .12s ease,
           opacity .12s ease,
           filter .12s ease;
       "

       onmouseover="
         this.style.filter='brightness(1.08)'
       "

       onmouseout="
         this.style.filter='brightness(1)';
         this.style.transform='scale(1)';
         this.style.opacity='1';
       "

       ontouchstart="
         this.style.transform='scale(.96)';
         this.style.opacity='.7';
         this.style.filter='brightness(.8)';
       "

       ontouchend="
         this.style.transform='scale(1)';
         this.style.opacity='1';
         this.style.filter='brightness(1.08)';
       "

       onmousedown="
         this.style.transform='scale(.96)';
         this.style.opacity='.7';
         this.style.filter='brightness(.8)';
       "

       onmouseup="
         this.style.transform='scale(1)';
         this.style.opacity='1';
         this.style.filter='brightness(1.08)';
       "
     >
       Thêm gói
     </button>

      </div>

      <!-- các UI khác của bạn -->




    `;

  }

  page.innerHTML = html;

}

/* DETAIL */

window.openDetail = function(productId, packageId){
  currentProductId = productId;
  currentPackageId = packageId;
  const product =
  products.find(p=>p.id === productId);

  const item =
  product.packages[packageId];

  hideMainUI();
  document.getElementById("packagePage").style.display = "none";

  const page =
  document.getElementById("detailPage");

  page.style.display = "block";

  page.innerHTML = `

    <button
      onclick="openPackages('${productId}')"
      style="
        margin-bottom:20px;
        height:50px;
        padding:0 20px;
        border:none;
        border-radius:16px;
        background:#11193d;
        color:white;
        font-weight:700;
      "
    >
      ← Quay lại
    </button>

    <div style="
      font-size:20px;
      font-weight:800;
    ">
      ${product.name}
    </div>

    <div style="
      margin-top:8px;
      color:#9aa4d3;
      font-size:18px;
    ">
      ${item.brand} • ${item.name}
    </div>

    <div style="
      background:#11193d;
      margin-top:24px;
      border-radius:24px;
      padding:20px;
    ">

      <div style="
        font-size:20px;
        font-weight:800;
      ">
        ${item.name}
      </div>

      <div style="
        margin-top:20px;
        padding:10px;
        border:1px dashed rgba(255,255,255,.2);
        border-radius:18px;
        display:flex;
        justify-content:space-between;
        font-size:15px;
        font-weight:800;
      ">
        <span>Giá</span>
        <span>${item.price}</span>
      </div>

      <div style="
        margin-top:14px;
        padding:10px;
        border:1px dashed rgba(255,255,255,.2);
        border-radius:18px;
        display:flex;
        justify-content:space-between;
        font-size:15px;
        font-weight:800;
      ">
        <span>Hàng còn lại</span>
        <span>${item.stock}</span>
      </div>

     <img
  src="${item.image || product.image}"
  draggable="false"
  oncontextmenu="return false"
  style="
    width:100%;
    aspect-ratio:16/9;
    object-fit:cover;
    border-radius:24px;
    margin-top:20px;
    display:block;
    user-select:none;
    -webkit-user-drag:none;
    pointer-events:none;
  "
>

   <div style="
  margin-top:20px;
  line-height:1.7;
  color:#dfe5ff;
  font-size:18px;
  white-space:pre-line;
">
  ${item.description || ""}
</div>

      <button
   onclick="buyNow('${productId}','${packageId}')"
   style="
      width:100%;
      height:40px;
      border:none;
      border-radius:14px;
      margin-top:20px;
      background:#7b63ff;
      color:white;
      font-size:15px;
      font-weight:800;
      transition:
           transform .12s ease,
           opacity .12s ease,
           filter .12s ease;
       "

       onmouseover="
         this.style.filter='brightness(1.08)'
       "

       onmouseout="
         this.style.filter='brightness(1)';
         this.style.transform='scale(1)';
         this.style.opacity='1';
       "

       ontouchstart="
         this.style.transform='scale(.96)';
         this.style.opacity='.7';
         this.style.filter='brightness(.8)';
       "

       ontouchend="
         this.style.transform='scale(1)';
         this.style.opacity='1';
         this.style.filter='brightness(1.08)';
       "

       onmousedown="
         this.style.transform='scale(.96)';
         this.style.opacity='.7';
         this.style.filter='brightness(.8)';
       "

       onmouseup="
         this.style.transform='scale(1)';
         this.style.opacity='1';
         this.style.filter='brightness(1.08)';
       "
     >
       Tạo QR / Mua
     </button>
    </div>

  `;

}


   window.buyNow = async function(productId, packageId){

   const product =
      products.find(p => p.id === productId);

   if(!product) return;

   const item =
      product.packages?.[packageId];

   if(!item) return;

   // lấy giá số
   const price =
      Number(
         String(item.price || 0)
         .replace(/\./g, "")
         .replace(/[^\d]/g, "")
      );

   try{

      // lấy số dư
      const res =
         await fetch(
            `../api/get-balance?userId=${user.id}`
         );

      const data =
         await res.json();

      const balance =
         Number(data.balance || 0);

      // =====================
      // ĐỦ TIỀN -> MUA LUÔN
      // =====================

      if(balance >= price){

         const buyRes =
            await fetch(
               "../api/buy-product",
               {
                  method:"POST",
                  headers:{
                     "Content-Type":"application/json"
                  },
                  body:JSON.stringify({
                     userId:user.id,
                     amount:price,
                     productId,
                     packageId
                  })
               }
            );

         const buyData =
            await buyRes.json();

         if(buyData.success){

            await loadBalance();

            // lưu lịch sử đơn THÀNH CÔNG
            saveOrderHistory({

               product:
               `${product.name} • ${item.name}`,

               type:
               "Đã mua",

               amount: price,

               content:
buyData.data?.key ||
buyData.key ||
"Đã giao key",

               needPay: false,

               status: "Đã thanh toán",

               statusClass: "success",

               createdAt: Date.now()

            });

            alert("Mua thành công");

            openPackages(productId);

         }else{

            alert(
               buyData.message ||
               "Mua thất bại"
            );

         }

         return;
      }

      // =====================
      // THIẾU TIỀN -> TẠO QR
      // =====================

      const need = price - balance;

      saveOrderHistory({

         product:
         `${product.name} • ${item.name}`,

         type:
         "Thiếu số dư",

         amount: need,

         content:
         `NAP ${need}`,

         needPay: true,

         expiredAt:
         Date.now() + 15 * 60 * 1000,

         status: "Chưa thanh toán",

         statusClass: "pending",

         createdAt: Date.now()

      });

      alert(
         `Số dư không đủ\nTự tạo QR ${need.toLocaleString()}đ`
      );

      window.location.href =
         `/deposit/deposit.html?amount=${need}`;

   }catch(err){

      console.log("BUY ERROR:", err);

      alert(
         err.message ||
         "Có lỗi xảy ra"
      );

   }

}
/* ADD PRODUCT */

window.addGame = async function(){

  const name =
  document.getElementById("gameName1").value.trim();

  const type =
  document.getElementById("gameType1").value.trim();

  const image =
  document.getElementById("gameImage1").value.trim();

  if(!name || !image){

    tg.showAlert("Điền đủ");

    return;

  }

  await push(productsRef,{
    name,
    type,
    image,
    packages:{}
  });

  tg.showAlert("Đã thêm");

}

window.editProduct = function(productId){

   const product =
   products.find(p => p.id === productId);

   if(!product) return;

   const overlay =
   document.getElementById("modalOverlay1");

   const box =
   document.getElementById("modalBox1");

   box.innerHTML = `

      <h3 style="margin-bottom:12px">
         Sửa sản phẩm
      </h3>

      <input
         id="epName1"
         value="${product.name || ""}"
         placeholder="Tên sản phẩm"
         style="
            width:100%;
            margin-bottom:10px;
            padding:10px;
            border-radius:10px;
            border:none
         "
      >

      <input
         id="epType1"
         value="${product.type || ""}"
         placeholder="Loại"
         style="
            width:100%;
            margin-bottom:10px;
            padding:10px;
            border-radius:10px;
            border:none
         "
      >

      <input
         id="epImage1"
         value="${product.image || ""}"
         placeholder="Link logo"
         style="
            width:100%;
            margin-bottom:10px;
            padding:10px;
            border-radius:10px;
            border:none
         "
      >

      <button
         onclick="saveProductEdit('${productId}')"
         style="
            width:100%;
            padding:10px;
            border:none;
            border-radius:10px;
            background:#7b63ff;
            color:white;
            font-weight:700;
         "
      >
         Lưu
      </button>

   `;

   overlay.style.display = "flex";

   overlay.onclick = function(e){

      if(e.target === overlay){

         overlay.style.display = "none";

      }

   };

}
window.saveProductEdit = async function(productId){

   const name =
   document.getElementById("epName1")
   .value.trim();

   const type =
   document.getElementById("epType1")
   .value.trim();

   const image =
   document.getElementById("epImage1")
   .value.trim();

   try{

      await update(

         ref(db, `products/${productId}`),

         {
            name,
            type,
            image
         }

      );

      document.getElementById(
         "modalOverlay1"
      ).style.display = "none";

      alert("Đã lưu");

   }catch(err){

      console.log(err);

      alert("Lưu thất bại");

   }

}
/* ADD PACKAGE */

window.addPackage = async function(productId){

   const name =
   document.getElementById("pkgName")
   .value.trim();

   const price =
   document.getElementById("pkgPrice")
   .value.trim();

   const brand =
   document.getElementById("pkgBrand")
   .value.trim();

   const image =
   document.getElementById("pkgImage")
   .value.trim();

   const download =
   document.getElementById("pkgDownload")
   .value.trim();

   const desc =
   document.getElementById("pkgDesc")
   .value.trim();

   const rawKeys =
   document.getElementById("pkgKeys")
   .value.trim();

   if(!name){
      return alert("Nhập tên gói");
   }

   if(!price){
      return alert("Nhập giá");
   }

   if(!brand){
      return alert("Nhập hãng");
   }

   const keys =
   rawKeys
   .split("\n")
   .map(v=>v.trim())
   .filter(v=>v);

   if(keys.length <= 0){
      return alert("Nhập ít nhất 1 key");
   }

   const newPackage = {

      name,
      price,
      brand,

      description: desc,

      stock: keys.length,

      image,

      download,

      keys

   };

   try{

      await push(

         ref(
            db,
            `products/${productId}/packages`
         ),

         newPackage

      );

      alert("Đã thêm gói");

      openPackages(productId);

   }catch(err){

      console.log(err);

      alert("Lưu thất bại");

   }

}


  
window.editPackage = function(productId, packageKey){

   const product = products.find(p => p.id === productId);
   if(!product) return;

   const item = product.packages?.[packageKey];
   if(!item) return;

   const overlay = document.getElementById("modalOverlay");
   const box = document.getElementById("modalBox");

   box.innerHTML = `
     <h3 style="margin-bottom:12px;">Sửa gói</h3>

     <input id="eName" value="${item.name}" placeholder="Tên gói"
       style="width:100%;margin-bottom:10px;padding:10px;border-radius:10px;border:none">

     <input id="ePrice" value="${item.price}" placeholder="Giá"
       style="width:100%;margin-bottom:10px;padding:10px;border-radius:10px;border:none">

     <input id="eBrand" value="${item.brand}" placeholder="Hãng"
       style="width:100%;margin-bottom:10px;padding:10px;border-radius:10px;border:none">

<input id="ePackageImage"
  value="${item.image || ""}"
  placeholder="Ảnh chi tiết / ảnh gói"
  style="
    width:100%;
    margin-bottom:10px;
    padding:10px;
    border-radius:10px;
    border:none
">

<input
  id="eDownload"
  value="${item.download || ""}"
  placeholder="Link download"
  style="
    width:100%;
    margin-bottom:10px;
    padding:10px;
    border-radius:10px;
    border:none
">


     <textarea id="eKeys"
       style="width:100%;height:120px;margin-bottom:10px;border-radius:10px;padding:10px"
     >${(item.keys || []).join("\n")}</textarea>

     <div style="font-size:12px;opacity:.7;margin-bottom:10px">
       VD:<br>
       NETFLIX-123<br>
       NETFLIX-456<br>
       NETFLIX-789
     </div>

     <button
       onclick="saveEdit(event,'${productId}','${packageKey}')"
       style="
         width:100%;
         padding:10px;
         border:none;
         border-radius:10px;
         background:#7b63ff;
         color:white;
         font-weight:700;
         transition:
           transform .12s ease,
           opacity .12s ease,
           filter .12s ease;
       "

       onmouseover="
         this.style.filter='brightness(1.08)'
       "

       onmouseout="
         this.style.filter='brightness(1)';
         this.style.transform='scale(1)';
         this.style.opacity='1';
       "

       ontouchstart="
         this.style.transform='scale(.96)';
         this.style.opacity='.7';
         this.style.filter='brightness(.8)';
       "

       ontouchend="
         this.style.transform='scale(1)';
         this.style.opacity='1';
         this.style.filter='brightness(1.08)';
       "

       onmousedown="
         this.style.transform='scale(.96)';
         this.style.opacity='.7';
         this.style.filter='brightness(.8)';
       "

       onmouseup="
         this.style.transform='scale(1)';
         this.style.opacity='1';
         this.style.filter='brightness(1.08)';
       "
     >
       Lưu
     </button>
   `;

   overlay.style.display = "flex";

   // bấm ra ngoài để đóng
   overlay.onclick = function(e){
      if(e.target === overlay){
         overlay.style.display = "none";
      }
   };
}
/* DELETE PRODUCT */

window.deleteProduct = async function(id){

  await remove(ref(db,"products/"+id));

}
/* DELETE PACKAGE */

window.deletePackage = async function(productId, packageId){

  await remove(
    ref(db,
    `products/${productId}/packages/${packageId}`)
  );

}
window.saveEdit = async function(event, productId, packageKey){

   const btn = event.target;

   const name =
   document.getElementById("eName").value.trim();

   const price =
   document.getElementById("ePrice").value.trim();

   const brand =
   document.getElementById("eBrand").value.trim();

   const image =
   document.getElementById("ePackageImage")
   .value.trim();

   const download =
   document.getElementById("eDownload")
   .value.trim();

   const keys =
   document.getElementById("eKeys").value
   .split("\n")
   .map(v => v.trim())
   .filter(v => v);

   if(!name || !price || !brand){

      alert("Nhập đủ thông tin");
      return;

   }

   btn.disabled = true;
   btn.innerText = "Đang lưu...";
   btn.style.opacity = ".6";

   try{

      await update(

         ref(
            db,
            `products/${productId}/packages/${packageKey}`
         ),

         {
            name,
            price,
            brand,
            image,
            download,
            keys,
            stock: keys.length
         }

      );

      btn.innerText = "Đã lưu ✓";

      setTimeout(()=>{

         document.getElementById(
            "modalOverlay"
         ).style.display = "none";

         openPackages(productId);

      },700);

   }catch(err){

      console.log(err);

      btn.disabled = false;
      btn.innerText = "Lưu";
      btn.style.opacity = "1";

      alert("Lưu thất bại");

   }

}

/* SEARCH */

window.searchProducts = function(){

  const value =
  document.getElementById("searchInput")
  .value
  .toLowerCase();

  const filtered =
  products.filter((p)=>

    p.name.toLowerCase()
    .includes(value)

  );

  renderProducts(filtered);

}

/* REFRESH */

window.reloadPage = function(){

  location.reload();

}

/* =========================
   CLOSE MINIAPP
========================= */

window.closeMiniApp = function(){

   if(window.Telegram?.WebApp){

      Telegram.WebApp.close();

   }else{

      window.close();

   }

}

/* =========================
   CHẶN COPY TOÀN BỘ
========================= */

/* CHẶN CHỌN TEXT */

document.addEventListener("selectstart", (e) => {

  const tag = e.target.tagName;

  if (
    tag !== "INPUT" &&
    tag !== "TEXTAREA"
  ) {
    e.preventDefault();
  }

});

/* CHẶN COPY */

document.addEventListener("copy", (e) => {

  const active =
  document.activeElement.tagName;

  if (
    active !== "INPUT" &&
    active !== "TEXTAREA"
  ) {
    e.preventDefault();
  }

});

/* CHẶN CUT */

document.addEventListener("cut", (e) => {

  const active =
  document.activeElement.tagName;

  if (
    active !== "INPUT" &&
    active !== "TEXTAREA"
  ) {
    e.preventDefault();
  }

});

/* CHẶN PASTE NGOÀI INPUT */

document.addEventListener("paste", (e) => {

  const active =
  document.activeElement.tagName;

  if (
    active !== "INPUT" &&
    active !== "TEXTAREA"
  ) {
    e.preventDefault();
  }

});

/* CHẶN CHUỘT PHẢI */

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

/* CHẶN GIỮ IOS */

document.addEventListener("touchstart", (e) => {

  const tag = e.target.tagName;

  if (
    tag !== "INPUT" &&
    tag !== "TEXTAREA"
  ) {

    e.target.style.webkitTouchCallout = "none";

  }

});

/* CHẶN KÉO ẢNH */

document.addEventListener("dragstart", (e) => {
  e.preventDefault();
});

/* CHẶN PHÍM TẮT */

document.addEventListener("keydown", (e) => {

  /* CTRL + C */
  if (e.ctrlKey && e.key.toLowerCase() === "c") {
    e.preventDefault();
  }

  /* CTRL + U */
  if (e.ctrlKey && e.key.toLowerCase() === "u") {
    e.preventDefault();
  }

  /* CTRL + S */
  if (e.ctrlKey && e.key.toLowerCase() === "s") {
    e.preventDefault();
  }

  /* CTRL + SHIFT + I */
  if (
    e.ctrlKey &&
    e.shiftKey &&
    e.key.toLowerCase() === "i"
  ) {
    e.preventDefault();
  }

  /* F12 */
  if (e.key === "F12") {
    e.preventDefault();
  }

});

/* CHẶN GIỮ ẢNH IOS */

document.querySelectorAll("img").forEach((img) => {

  img.setAttribute("draggable", "false");

  img.style.pointerEvents = "none";

  img.style.userSelect = "none";

  img.style.webkitUserDrag = "none";

  img.style.webkitTouchCallout = "none";

});

loadBalance();
checkAdmin();
