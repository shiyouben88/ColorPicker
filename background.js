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
    
    toast.style.cssText = `
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
      border: 1px solid ${isLightColor ? '#cccccc' : 'transparent'};
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