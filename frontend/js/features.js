/*global chrome*/
const CLOSE_TAB_PORT_NAME = 'CLOSE_TAB_PORT_NAME';

/**
 * First of all, send request to our ML api to check if this site is Phishing or not
 */
chrome.runtime.sendMessage('getPhishingRate', async (response) => {
  const resultScore = await response;

  // If the phishing percentage is higher than 60, block it:
  // if(resultScore >= 60) {
  //   const blockingEl = document.createElement('div');
  //   blockingEl.setAttribute('id', 'chongluadaoBlocking');
  //   blockingEl.innerHTML = `
  //   <div class="container">
  //     <div class="header center">
  //       <h1>
  //         <img src="${chrome.runtime.getURL('assets/logo.png')}" class="logo" alt="chongluadao.vn">
  //         An toàn trong tầm tay - ChongLuaDao.vn
  //       </h1>
  //     </div>
  //
  //     <h1 id="header">Trang <span class="sitetitle">${window.location}</span> đã bị khóa theo đánh giá cộng đồng </h1>
  //     <p>
  //       Những lý do sau đây dẫn đến trang này bị khóa do báo cáo của cộng đồng:
  //     </p>
  //
  //     <ol>
  //       <li>Trang giả mạo, lừa đảo lấy tiền, thông tin người khác</li>
  //       <li>Trang có nội dung độc hại (có chứa mã độc, hình ảnh đồi trụy, nội dung xấu ảnh hưởng tới trẻ nhỏ về tâm lý,...)</li>
  //       <li>Trang giả mạo, bôi nhọ danh dự người khác</li>
  //       <li>Trang phản động, chống phá chính quyền</li>
  //     </ol>
  //
  //     <p>
  //       Cách bảo vệ bạn trên không gian mạng <a href="#">tại đây</a>
  //     </p>
  //
  //     <div class="footer">
  //       <div><button class="app-btn success" id="close">Đóng</button></div>
  //       <div><button class="app-btn danger" id="allow">Tôi vẫn muốn xem trang này</button></div>
  //     </div>
  //   </div>
  //   `;
  //
  //   document.body.classList.add('chongluadao');
  //   document.body.appendChild(blockingEl);
  //
  //   const closeTabPort = chrome.runtime.connect({name: CLOSE_TAB_PORT_NAME});
  //
  //   document.querySelector('#chongluadaoBlocking #close').addEventListener('click', () => {
  //     closeTabPort.postMessage({close_tab: true});
  //     return false;
  //   });
  //
  //   document.querySelector('#chongluadaoBlocking #allow').addEventListener('click', () => {
  //     blockingEl.style.display = 'none';
  //   });
  // }
});
