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
          // 显示通知
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon128.png',
            title: '取色成功',
            message: `颜色值 ${color} 已复制到剪贴板`
          });
        });
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
      }
    });
}