#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创建同步的Demo视频：画面 + 字幕 + 背景音乐
"""
from PIL import Image, ImageDraw, ImageFont
import os
import subprocess
import shutil

WIDTH = 1920
HEIGHT = 1080
FPS = 30
BG = (10, 10, 26)
CARD_BG = (26, 26, 46)
ACCENT = (102, 126, 234)
WHITE = (255, 255, 255)
GRAY = (136, 136, 136)
GREEN = (76, 175, 80)
ORANGE = (255, 152, 0)

def get_font(size):
    try:
        return ImageFont.truetype("msyh.ttc", size)
    except:
        return ImageFont.load_default()

def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0+radius, y0, x1-radius, y1], fill=fill)
    draw.rectangle([x0, y0+radius, x1, y1-radius], fill=fill)
    draw.pieslice([x0, y0, x0+2*radius, y0+2*radius], 180, 270, fill=fill)
    draw.pieslice([x1-2*radius, y0, x1, y0+2*radius], 270, 360, fill=fill)
    draw.pieslice([x0, y1-2*radius, x0+2*radius, y1], 90, 180, fill=fill)
    draw.pieslice([x1-2*radius, y1-2*radius, x1, y1], 0, 90, fill=fill)

def add_subtitle(img, text):
    """在图片底部添加字幕"""
    draw = ImageDraw.Draw(img)
    font = get_font(28)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (WIDTH - tw) // 2
    y = HEIGHT - 80
    
    # 字幕背景
    draw.rectangle([x-20, y-10, x+tw+20, y+40], fill=(0, 0, 0, 200))
    draw.text((x, y), text, fill=WHITE, font=font)
    return img

def create_title_scene():
    """场景1: 标题 (0-5秒)"""
    frames = []
    for f in range(5 * FPS):
        img = Image.new('RGB', (WIDTH, HEIGHT), BG)
        draw = ImageDraw.Draw(img)
        
        # 装饰
        for i in range(6):
            x = 150 + i * 350
            y = 80 + (i % 2) * 200
            draw.ellipse([x-40, y-40, x+40, y+40], fill=(20, 20, 40))
        
        # 标题动画
        progress = min(1.0, f / (FPS * 0.8))
        y_offset = int(50 * (1 - progress))
        
        font_title = get_font(100)
        text = "AI-RWA Portfolio Optimizer"
        bbox = draw.textbbox((0, 0), text, font=font_title)
        tw = bbox[2] - bbox[0]
        draw.text(((WIDTH - tw) // 2, 350 + y_offset), text, fill=ACCENT, font=font_title)
        
        font_sub = get_font(40)
        sub = "智能投资组合优化器"
        bbox2 = draw.textbbox((0, 0), sub, font=font_sub)
        sw = bbox2[2] - bbox2[0]
        draw.text(((WIDTH - sw) // 2, 480 + y_offset), sub, fill=GRAY, font=font_sub)
        
        # 字幕
        img = add_subtitle(img, "AI-RWA Portfolio Optimizer - 智能投资组合优化器")
        frames.append(img)
    return frames

def create_dashboard_scene():
    """场景2: Dashboard (5-15秒)"""
    # 加载Dashboard截图
    try:
        ui_img = Image.open("frames/scene1.png").resize((WIDTH, HEIGHT))
    except:
        ui_img = Image.new('RGB', (WIDTH, HEIGHT), BG)
    
    frames = []
    captions = [
        "投资组合仪表盘",
        "实时监控投资组合表现",
        "AI智能建议优化配置",
        "总资产 $125,000",
        "24小时收益 +2.35%"
    ]
    
    for f in range(10 * FPS):
        img = ui_img.copy()
        
        # 顶部标题
        draw = ImageDraw.Draw(img)
        draw.rectangle([0, 0, WIDTH, 60], fill=(0, 0, 0, 200))
        draw.text((40, 15), "Dashboard - 投资组合仪表盘", fill=WHITE, font=get_font(28))
        
        # 字幕（每2秒切换）
        caption_idx = min(f // (2 * FPS), len(captions) - 1)
        img = add_subtitle(img, captions[caption_idx])
        
        frames.append(img)
    return frames

def create_portfolio_scene():
    """场景3: Portfolio (15-25秒)"""
    try:
        ui_img = Image.open("frames/scene2.png").resize((WIDTH, HEIGHT))
    except:
        ui_img = Image.new('RGB', (WIDTH, HEIGHT), BG)
    
    frames = []
    captions = [
        "投资组合管理",
        "轻松管理多种RWA资产",
        "代币化黄金、房地产、股票",
        "一键添加和配置",
        "自动再平衡功能"
    ]
    
    for f in range(10 * FPS):
        img = ui_img.copy()
        draw = ImageDraw.Draw(img)
        draw.rectangle([0, 0, WIDTH, 60], fill=(0, 0, 0, 200))
        draw.text((40, 15), "Portfolio - 投资组合管理", fill=WHITE, font=get_font(28))
        
        caption_idx = min(f // (2 * FPS), len(captions) - 1)
        img = add_subtitle(img, captions[caption_idx])
        
        frames.append(img)
    return frames

def create_ai_strategy_scene():
    """场景4: AI Strategy (25-35秒)"""
    try:
        ui_img = Image.open("frames/scene3.png").resize((WIDTH, HEIGHT))
    except:
        ui_img = Image.new('RGB', (WIDTH, HEIGHT), BG)
    
    frames = []
    captions = [
        "AI策略生成",
        "根据风险偏好生成策略",
        "预期收益 8.5%",
        "风险评分 45",
        "一键执行AI策略"
    ]
    
    for f in range(10 * FPS):
        img = ui_img.copy()
        draw = ImageDraw.Draw(img)
        draw.rectangle([0, 0, WIDTH, 60], fill=(0, 0, 0, 200))
        draw.text((40, 15), "AI Strategy - AI策略生成", fill=WHITE, font=get_font(28))
        
        caption_idx = min(f // (2 * FPS), len(captions) - 1)
        img = add_subtitle(img, captions[caption_idx])
        
        frames.append(img)
    return frames

def create_results_scene():
    """场景5: 项目成果 (35-45秒)"""
    frames = []
    captions = [
        "项目成果",
        "8个智能合约",
        "29个测试全部通过",
        "完整API文档",
        "基于HSK Chain，Chainlink Oracle"
    ]
    
    for f in range(10 * FPS):
        img = Image.new('RGB', (WIDTH, HEIGHT), BG)
        draw = ImageDraw.Draw(img)
        
        # 装饰
        for i in range(8):
            x = 100 + i * 250
            y = 80 + (i % 3) * 150
            draw.ellipse([x-25, y-25, x+25, y+25], fill=(20, 20, 40))
        
        # 标题
        font_title = get_font(72)
        text = "项目成果"
        bbox = draw.textbbox((0, 0), text, font=font_title)
        tw = bbox[2] - bbox[0]
        draw.text(((WIDTH - tw) // 2, 200), text, fill=WHITE, font=font_title)
        
        # 统计数据
        stats = [("8", "智能合约"), ("29", "测试通过"), ("100%", "API覆盖")]
        for i, (val, label) in enumerate(stats):
            x = 200 + i * 500
            font_val = get_font(64)
            font_lab = get_font(24)
            
            bbox = draw.textbbox((0, 0), val, font=font_val)
            vw = bbox[2] - bbox[0]
            draw.text((x + (300 - vw) // 2, 400), val, fill=ACCENT, font=font_val)
            
            bbox = draw.textbbox((0, 0), label, font=font_lab)
            lw = bbox[2] - bbox[0]
            draw.text((x + (300 - lw) // 2, 480), label, fill=GRAY, font=font_lab)
        
        caption_idx = min(f // (2 * FPS), len(captions) - 1)
        img = add_subtitle(img, captions[caption_idx])
        
        frames.append(img)
    return frames

def create_cta_scene():
    """场景6: 结尾 (45-50秒)"""
    frames = []
    captions = [
        "AI-RWA Portfolio Optimizer",
        "让投资更智能",
        "立即体验"
    ]
    
    for f in range(5 * FPS):
        img = Image.new('RGB', (WIDTH, HEIGHT), BG)
        draw = ImageDraw.Draw(img)
        
        # 装饰
        for i in range(6):
            x = 150 + i * 350
            y = 80 + (i % 2) * 200
            draw.ellipse([x-40, y-40, x+40, y+40], fill=(20, 20, 40))
        
        # 标题
        font_title = get_font(100)
        text = "AI-RWA Portfolio Optimizer"
        bbox = draw.textbbox((0, 0), text, font=font_title)
        tw = bbox[2] - bbox[0]
        draw.text(((WIDTH - tw) // 2, 350), text, fill=ACCENT, font=font_title)
        
        font_sub = get_font(48)
        sub = "让投资更智能"
        bbox2 = draw.textbbox((0, 0), sub, font=font_sub)
        sw = bbox2[2] - bbox2[0]
        draw.text(((WIDTH - sw) // 2, 480), sub, fill=WHITE, font=font_sub)
        
        caption_idx = min(f // (2 * FPS), len(captions) - 1)
        img = add_subtitle(img, captions[caption_idx])
        
        frames.append(img)
    return frames

def main():
    print("Creating synchronized demo video...")
    
    # 清理旧文件
    if os.path.exists("demo/frames_sync"):
        shutil.rmtree("demo/frames_sync")
    os.makedirs("demo/frames_sync", exist_ok=True)
    
    all_frames = []
    
    # 场景1: 标题 (0-5秒)
    print("  Scene 1: Title (0-5s)...")
    all_frames.extend(create_title_scene())
    
    # 场景2: Dashboard (5-15秒)
    print("  Scene 2: Dashboard (5-15s)...")
    all_frames.extend(create_dashboard_scene())
    
    # 场景3: Portfolio (15-25秒)
    print("  Scene 3: Portfolio (15-25s)...")
    all_frames.extend(create_portfolio_scene())
    
    # 场景4: AI Strategy (25-35秒)
    print("  Scene 4: AI Strategy (25-35s)...")
    all_frames.extend(create_ai_strategy_scene())
    
    # 场景5: 项目成果 (35-45秒)
    print("  Scene 5: Results (35-45s)...")
    all_frames.extend(create_results_scene())
    
    # 场景6: 结尾 (45-50秒)
    print("  Scene 6: CTA (45-50s)...")
    all_frames.extend(create_cta_scene())
    
    # 保存帧
    print(f"  Saving {len(all_frames)} frames...")
    for i, frame in enumerate(all_frames):
        frame.save(f"demo/frames_sync/frame_{i:06d}.png")
    
    # 创建字幕文件 (SRT)
    print("  Creating subtitles...")
    srt_content = """1
00:00:00,000 --> 00:00:05,000
AI-RWA Portfolio Optimizer
智能投资组合优化器

2
00:00:05,000 --> 00:00:07,000
投资组合仪表盘

3
00:00:07,000 --> 00:00:09,000
实时监控投资组合表现

4
00:00:09,000 --> 00:00:11,000
AI智能建议优化配置

5
00:00:11,000 --> 00:00:13,000
总资产 $125,000

6
00:00:13,000 --> 00:00:15,000
24小时收益 +2.35%

7
00:00:15,000 --> 00:00:17,000
投资组合管理

8
00:00:17,000 --> 00:00:19,000
轻松管理多种RWA资产

9
00:00:19,000 --> 00:00:21,000
代币化黄金、房地产、股票

10
00:00:21,000 --> 00:00:23,000
一键添加和配置

11
00:00:23,000 --> 00:00:25,000
自动再平衡功能

12
00:00:25,000 --> 00:00:27,000
AI策略生成

13
00:00:27,000 --> 00:00:29,000
根据风险偏好生成策略

14
00:00:29,000 --> 00:00:31,000
预期收益 8.5%

15
00:00:31,000 --> 00:00:33,000
风险评分 45

16
00:00:33,000 --> 00:00:35,000
一键执行AI策略

17
00:00:35,000 --> 00:00:37,000
项目成果

18
00:00:37,000 --> 00:00:39,000
8个智能合约

19
00:00:39,000 --> 00:00:41,000
29个测试全部通过

20
00:00:41,000 --> 00:00:43,000
完整API文档

21
00:00:43,000 --> 00:00:45,000
基于HSK Chain，Chainlink Oracle

22
00:00:45,000 --> 00:00:47,000
AI-RWA Portfolio Optimizer

23
00:00:47,000 --> 00:00:49,000
让投资更智能

24
00:00:49,000 --> 00:00:50,000
立即体验
"""
    with open("demo/subtitles_sync.srt", "w", encoding="utf-8") as f:
        f.write(srt_content)
    
    # 编码视频
    print("  Encoding video...")
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", "frames_sync/frame_%06d.png",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "ai-rwa-demo-v4.mp4"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"  Error: {result.stderr[-200:]}")
        return
    
    # 合并背景音乐
    print("  Adding background music...")
    cmd = [
        "ffmpeg", "-y",
        "-i", "ai-rwa-demo-v4.mp4",
        "-i", "bgm_rhythm2.m4a",
        "-filter_complex", "[1:a]volume=2.0[loud]",
        "-map", "0:v",
        "-map", "[loud]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "ai-rwa-demo-v4-final.mp4"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"  Error: {result.stderr[-200:]}")
        return
    
    # 清理
    shutil.rmtree("demo/frames_sync", ignore_errors=True)
    
    # 验证
    print("  Verifying...")
    probe = subprocess.run(
        ["ffprobe", "-hide_banner", "demo/ai-rwa-demo-v4-final.mp4"],
        capture_output=True, text=True
    )
    
    print("\n=== FINAL VIDEO ===")
    print(probe.stdout)
    print("Done!")

if __name__ == "__main__":
    main()