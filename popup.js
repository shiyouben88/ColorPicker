document.addEventListener('DOMContentLoaded', () => {
  const colorDisplay = document.getElementById('colorDisplay');
  const colorValue = document.getElementById('colorValue');
  const pickButton = document.getElementById('pickButton');
  const status = document.getElementById('status');

  // 检查是否支持 EyeDropper API
  if (!window.EyeDropper) {
    status.textContent = '您的浏览器不支持取色功能';
    pickButton.disabled = true;
    return;
  }

  const eyeDropper = new EyeDropper();

  pickButton.addEventListener('click', async () => {
    try {
      // 更改按钮状态
      pickButton.disabled = true;
      pickButton.textContent = '取色中...';
      status.textContent = '';

      // 开始取色
      const result = await eyeDropper.open();
      const color = result.sRGBHex;

      // 更新显示
      colorDisplay.style.backgroundColor = color;
      colorValue.textContent = color;

      // 复制到剪贴板
      await navigator.clipboard.writeText(color);
      status.textContent = '颜色已复制到剪贴板';
    } catch (error) {
      if (error.name === 'AbortError') {
        status.textContent = '取色已取消';
      } else {
        status.textContent = '取色过程中出现错误';
        console.error(error);
      }
    } finally {
      // 恢复按钮状态
      pickButton.disabled = false;
      pickButton.textContent = '开始取色';
    }
  });
}));