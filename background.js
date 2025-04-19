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
          createToast(message, color);
        });
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
      }
    });
    
  // 判断颜色亮度的辅助函数
  function isColorLight(color) {
    // 移除可能的 # 前缀
    const hex = color.replace('#', '');
    
    // 将十六进制转换为 RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 计算亮度 (基于人眼对不同颜色的感知)
    // 公式: (0.299*R + 0.587*G + 0.114*B) / 255
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // 亮度大于 0.5 认为是浅色
    return brightness > 0.5;
  }

  // 将 toast 创建函数移到注入脚本的作用域内
  function createToast(message, color) {
    // 创建 toast 元素
    const toast = document.createElement('div');
    toast.textContent = message;
    
    // 计算颜色亮度，决定文字颜色
    const isLightColor = isColorLight(color);
    const textColor = isLightColor ? '#000000' : '#ffffff';
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes heartBeat {
        0% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.08); }
        100% { transform: translateX(-50%) scale(1); }
      }
      @keyframes slideIn {
        0% { top: -50px; opacity: 0; }
        100% { top: 20px; opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    toast.style.cssText = `
      animation: slideIn 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55), heartBeat 1.2s ease-in-out 0.7s 3;
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color};
      color: ${textColor};
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      pointer-events: none;
      border: 1px solid ${isLightColor ? '#ccccccaa' : 'rgba(255,255,255,0.2)'};
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) scale(0.9)';
      toast.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
      setTimeout(() => {
        toast.remove();
        style.remove();
      }, 400);
    }, 3000);
  }
}