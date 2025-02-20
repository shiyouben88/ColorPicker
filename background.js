chrome.action.onClicked.addListener(async (tab) => {
  try {
    // 注入脚本到当前标签页
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: startColorPicker
    });
  } catch (error) {
    console.error('Error:', error);
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'showNotification') {
    const notificationId = Date.now().toString();
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: '取色成功！',
      message: `色值：${message.color}\n已自动复制到剪贴板`
    });
    // 3秒后自动关闭通知
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 3000);
  }
});

function startColorPicker() {
  if (!window.EyeDropper) {
    console.error('EyeDropper API not supported');
    return;
  }

  const eyeDropper = new EyeDropper();
  eyeDropper.open()
    .then(result => {
      const color = result.sRGBHex;
      // 复制颜色值到剪贴板
      navigator.clipboard.writeText(color)
        .then(() => {
          // 获取翻译文本
          const message = chrome.i18n.getMessage('colorCopied', [color]);
          // 创建并显示 toast 提示
          createToast(message);
        });
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
      }
    });

  // 将 toast 创建函数移到注入脚本的作用域内
  function createToast(message) {
    // 创建 toast 元素
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      pointer-events: none;
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
}