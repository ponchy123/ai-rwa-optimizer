#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI-RWA Portfolio Optimizer Demo Video Generator
使用PIL生成图片序列，然后用FFmpeg合成视频
"""

from PIL import Image, ImageDraw, ImageFont
import os
import subprocess

# 视频配置
WIDTH = 1920
HEIGHT = 1080
FPS = 30

# 颜色配置
BG_COLOR = (10, 10, 26)  # #0a0a1a
ACCENT_COLOR = (102, 126, 234)  # #667eea
WHITE = (255, 255, 255)
GRAY = (170, 170, 170)

def create_frame(text_lines, fontsize=60, color=WHITE, bg_color=BG_COLOR):
    """使用PIL创建带文字的帧"""
    img = Image.new('RGB', (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("msyh.ttc", fontsize)
    except:
        font = ImageFont.load_default()
    
    # 计算总高度
    total_height = len(text_lines) * (fontsize + 20)
    start_y = (HEIGHT - total_height) // 2
    
    for i, line in enumerate(text_lines):
        if line:  # 跳过空行
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            x = (WIDTH - text_width) // 2
            y = start_y + i * (fontsize + 20)
            draw.text((x, y), line, fill=color, font=font)
    
    return img

def main():
    print("开始创建Demo视频...")
    
    # 创建输出目录
    os.makedirs("demo/frames", exist_ok=True)
    
    # 场景配置
    scenes = [
        # (文本行, 字体大小, 颜色, 持续秒数)
        (["AI-RWA", "Portfolio Optimizer", "智能投资组合优化器"], 100, WHITE, 5),
        (["传统DeFi的痛点", "", "管理多种RWA资产太复杂？", "手动再平衡太麻烦？", "没有AI辅助决策？"], 60, WHITE, 10),
        (["AI驱动的RWA管理", "", "智能投资组合管理", "支持代币化的黄金、房地产、股票", "AI自动优化配置"], 60, WHITE, 10),
        (["核心功能", "", "AI策略 - 智能生成", "自动再平衡 - 实时调整", "价格追踪 - Chainlink Oracle"], 60, WHITE, 10),
        (["技术架构", "", "基于HSK Chain", "集成Chainlink Oracle", "多层安全机制", "完整测试覆盖"], 60, WHITE, 10),
        (["项目成果", "", "8 个智能合约", "29 个测试通过", "100% API覆盖", "完整文档"], 60, WHITE, 10),
        (["AI-RWA", "让投资更智能", "立即体验"], 100, WHITE, 5),
    ]
    
    frame_index = 0
    
    for scene_idx, (text_lines, fontsize, color, duration) in enumerate(scenes):
        print(f"  生成场景 {scene_idx + 1}/7...")
        
        # 生成该场景的所有帧
        for frame_num in range(duration * FPS):
            img = create_frame(text_lines, fontsize, color)
            img.save(f"demo/frames/frame_{frame_index:06d}.png")
            frame_index += 1
    
    print(f"  共生成 {frame_index} 帧")
    
    # 使用FFmpeg合成视频
    print("  使用FFmpeg合成视频...")
    
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", "demo/frames/frame_%06d.png",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "demo/ai-rwa-demo-v2.mp4"
    ]
    
    result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("视频已保存到: demo/ai-rwa-demo-v2.mp4")
    else:
        print(f"FFmpeg错误: {result.stderr}")
    
    # 清理帧文件
    print("  清理临时帧文件...")
    for f in os.listdir("demo/frames"):
        os.remove(os.path.join("demo/frames", f))
    os.rmdir("demo/frames")
    
    print("完成！")

if __name__ == "__main__":
    main()