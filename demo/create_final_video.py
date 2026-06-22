#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创建最终Demo视频：标题 + 产品界面 + 过渡
"""
from PIL import Image, ImageDraw, ImageFont
import os
import subprocess

WIDTH = 1920
HEIGHT = 1080
FPS = 30
BG = (10, 10, 26)
ACCENT = (102, 126, 234)
WHITE = (255, 255, 255)
GRAY = (136, 136, 136)

def get_font(size):
    try:
        return ImageFont.truetype("msyh.ttc", size)
    except:
        return ImageFont.load_default()

def create_title_frame(text, subtitle="", duration_sec=5):
    """创建标题帧"""
    frames = []
    for f in range(duration_sec * FPS):
        img = Image.new('RGB', (WIDTH, HEIGHT), BG)
        draw = ImageDraw.Draw(img)
        
        # 背景装饰
        for i in range(5):
            x = 200 + i * 400
            y = 100 + (i % 2) * 200
            draw.ellipse([x-50, y-50, x+50, y+50], fill=(20, 20, 40))
        
        # 标题
        progress = min(1.0, f / (FPS * 0.5))
        alpha = int(255 * progress)
        
        font_title = get_font(100)
        bbox = draw.textbbox((0, 0), text, font=font_title)
        tw = bbox[2] - bbox[0]
        x = (WIDTH - tw) // 2
        y = 350
        
        if progress < 1:
            y = int(350 + 50 * (1 - progress))
        
        draw.text((x, y), text, fill=ACCENT, font=font_title)
        
        if subtitle:
            font_sub = get_font(40)
            bbox2 = draw.textbbox((0, 0), subtitle, font=font_sub)
            sw = bbox2[2] - bbox2[0]
            draw.text(((WIDTH - sw) // 2, y + 120), subtitle, fill=GRAY, font=font_sub)
        
        frames.append(img)
    return frames

def create_ui_frame(ui_image_path, title, caption, duration_sec=10):
    """创建产品界面帧（带标题和字幕）"""
    ui_img = Image.open(ui_image_path).resize((WIDTH, HEIGHT))
    frames = []
    
    for f in range(duration_sec * FPS):
        img = ui_img.copy()
        draw = ImageDraw.Draw(img)
        
        # 顶部标题栏
        draw.rectangle([0, 0, WIDTH, 60], fill=(0, 0, 0, 180))
        font_title = get_font(28)
        draw.text((40, 15), title, fill=WHITE, font=font_title)
        
        # 底部字幕
        draw.rectangle([0, HEIGHT-80, WIDTH, HEIGHT], fill=(0, 0, 0, 180))
        font_caption = get_font(24)
        bbox = draw.textbbox((0, 0), caption, font=font_caption)
        cw = bbox[2] - bbox[0]
        draw.text(((WIDTH - cw) // 2, HEIGHT - 60), caption, fill=WHITE, font=font_caption)
        
        frames.append(img)
    return frames

def create_result_frame(stats, cta, duration_sec=10):
    """创建结果展示帧"""
    frames = []
    for f in range(duration_sec * FPS):
        img = Image.new('RGB', (WIDTH, HEIGHT), BG)
        draw = ImageDraw.Draw(img)
        
        # 背景装饰
        for i in range(8):
            x = 100 + i * 250
            y = 80 + (i % 3) * 150
            draw.ellipse([x-30, y-30, x+30, y+30], fill=(20, 20, 40))
        
        # 标题
        font_title = get_font(72)
        bbox = draw.textbbox((0, 0), "项目成果", font=font_title)
        tw = bbox[2] - bbox[0]
        draw.text(((WIDTH - tw) // 2, 200), "项目成果", fill=WHITE, font=font_title)
        
        # 统计数据
        for i, (value, label) in enumerate(stats):
            x = 200 + i * 500
            y = 400
            font_val = get_font(64)
            font_lab = get_font(24)
            
            bbox = draw.textbbox((0, 0), value, font=font_val)
            vw = bbox[2] - bbox[0]
            draw.text((x + (300 - vw) // 2, y), value, fill=ACCENT, font=font_val)
            
            bbox = draw.textbbox((0, 0), label, font=font_lab)
            lw = bbox[2] - bbox[0]
            draw.text((x + (300 - lw) // 2, y + 80), label, fill=GRAY, font=font_lab)
        
        # CTA
        font_cta = get_font(36)
        bbox = draw.textbbox((0, 0), cta, font=font_cta)
        cw = bbox[2] - bbox[0]
        draw.text(((WIDTH - cw) // 2, 650), cta, fill=ACCENT, font=font_cta)
        
        frames.append(img)
    return frames

def main():
    print("Creating final demo video...")
    
    os.makedirs("demo/frames_final", exist_ok=True)
    
    all_frames = []
    
    # 场景1: 标题 (0-5秒)
    print("  Scene 1: Title...")
    all_frames.extend(create_title_frame("AI-RWA Portfolio Optimizer", "智能投资组合优化器", 5))
    
    # 场景2: Dashboard界面 (5-15秒)
    print("  Scene 2: Dashboard...")
    all_frames.extend(create_ui_frame(
        "demo/frames/scene1.png",
        "投资组合仪表盘",
        "实时监控投资组合表现，AI智能建议优化配置",
        10
    ))
    
    # 场景3: Portfolio界面 (15-25秒)
    print("  Scene 3: Portfolio...")
    all_frames.extend(create_ui_frame(
        "demo/frames/scene2.png",
        "投资组合管理",
        "轻松管理多种RWA资产，一键添加和配置",
        10
    ))
    
    # 场景4: AI Strategy界面 (25-35秒)
    print("  Scene 4: AI Strategy...")
    all_frames.extend(create_ui_frame(
        "demo/frames/scene3.png",
        "AI策略生成",
        "根据风险偏好自动生成最优投资策略",
        10
    ))
    
    # 场景5: 项目成果 (35-45秒)
    print("  Scene 5: Results...")
    all_frames.extend(create_result_frame(
        [("8", "智能合约"), ("29", "测试通过"), ("100%", "API覆盖")],
        "基于HSK Chain，集成Chainlink Oracle",
        10
    ))
    
    # 场景6: 结尾 (45-50秒)
    print("  Scene 6: CTA...")
    all_frames.extend(create_title_frame("AI-RWA Portfolio Optimizer", "让投资更智能", 5))
    
    # 保存帧
    print(f"  Saving {len(all_frames)} frames...")
    for i, frame in enumerate(all_frames):
        frame.save(f"demo/frames_final/frame_{i:06d}.png")
    
    print("  Encoding video...")
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", "demo/frames_final/frame_%06d.png",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "demo/ai-rwa-demo-v3.mp4"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("Video saved: demo/ai-rwa-demo-v3.mp4")
    else:
        print(f"Error: {result.stderr[-200:]}")
    
    # 清理
    import shutil
    shutil.rmtree("demo/frames_final", ignore_errors=True)
    
    print("Done!")

if __name__ == "__main__":
    main()