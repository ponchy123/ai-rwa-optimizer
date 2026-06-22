#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
用Pillow直接绘制产品界面截图
"""
from PIL import Image, ImageDraw, ImageFont
import os

WIDTH = 1920
HEIGHT = 1080
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

def create_dashboard():
    """创建Dashboard界面"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)
    
    # Header
    draw.rectangle([0, 0, WIDTH, 80], fill=(17, 17, 17))
    draw.text((40, 25), "AI-RWA Optimizer", fill=ACCENT, font=get_font(24))
    
    # Nav items
    nav_items = ["仪表盘", "投资组合", "AI策略", "自动支付"]
    for i, item in enumerate(nav_items):
        x = 400 + i * 150
        if i == 0:
            draw_rounded_rect(draw, [x, 20, x+120, 60], 8, ACCENT)
            draw.text((x+30, 28), item, fill=WHITE, font=get_font(16))
        else:
            draw.text((x+30, 28), item, fill=GRAY, font=get_font(16))
    
    # Wallet button
    draw_rounded_rect(draw, [1700, 20, 1880, 60], 8, ACCENT)
    draw.text((1720, 28), "0x1234...5678", fill=WHITE, font=get_font(14))
    
    # Stats cards
    stats = [
        ("$125,000", "总投资价值"),
        ("+2.35%", "24小时收益"),
        ("+5.67%", "7天收益"),
        ("87%", "AI置信度")
    ]
    for i, (val, label) in enumerate(stats):
        x = 40 + i * 470
        draw_rounded_rect(draw, [x, 120, x+440, 280], 12, CARD_BG)
        draw.text((x+170, 150), val, fill=ACCENT, font=get_font(36))
        draw.text((x+160, 220), label, fill=GRAY, font=get_font(16))
    
    # Asset list card
    draw_rounded_rect(draw, [40, 320, 1300, 700], 12, CARD_BG)
    draw.text((70, 340), "资产配置", fill=WHITE, font=get_font(22))
    
    assets = [
        ("xAU", "代币化黄金", "40%", "$50,000", GREEN),
        ("xRE", "代币化房地产", "30%", "$37,500", ACCENT),
        ("xST", "代币化股票", "20%", "$25,000", ORANGE),
        ("USDT", "稳定币", "10%", "$12,500", (150, 150, 150))
    ]
    for i, (sym, name, pct, val, color) in enumerate(assets):
        y = 400 + i * 70
        draw.text((70, y), sym, fill=color, font=get_font(18))
        draw.text((150, y), name, fill=GRAY, font=get_font(16))
        draw.text((500, y), pct, fill=WHITE, font=get_font(16))
        draw.text((700, y), val, fill=WHITE, font=get_font(16))
        # Progress bar
        draw.rectangle([900, y+5, 1250, y+25], fill=(40, 40, 60))
        bar_width = int(float(pct.strip('%')) / 100 * 350)
        draw.rectangle([900, y+5, 900+bar_width, y+25], fill=color)
    
    # AI suggestions card
    draw_rounded_rect(draw, [1340, 320, 1880, 700], 12, CARD_BG)
    draw.text((1370, 340), "AI建议", fill=WHITE, font=get_font(22))
    
    suggestions = [
        ("增加稳定币配置", "建议从10%提高到15%"),
        ("优化再平衡频率", "当前波动性较高"),
        ("新增债券资产", "分散风险")
    ]
    for i, (title, desc) in enumerate(suggestions):
        y = 400 + i * 100
        draw_rounded_rect(draw, [1370, y, 1850, y+80], 8, (26, 26, 62))
        draw.rectangle([1370, y, 1374, y+80], fill=ACCENT)
        draw.text((1390, y+8), title, fill=WHITE, font=get_font(16))
        draw.text((1390, y+35), desc, fill=GRAY, font=get_font(13))
    
    return img

def create_portfolio():
    """创建Portfolio界面"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)
    
    # Header
    draw.rectangle([0, 0, WIDTH, 80], fill=(17, 17, 17))
    draw.text((40, 25), "AI-RWA Optimizer", fill=ACCENT, font=get_font(24))
    
    nav_items = ["仪表盘", "投资组合", "AI策略", "自动支付"]
    for i, item in enumerate(nav_items):
        x = 400 + i * 150
        if i == 1:
            draw_rounded_rect(draw, [x, 20, x+120, 60], 8, ACCENT)
            draw.text((x+20, 28), item, fill=WHITE, font=get_font(16))
        else:
            draw.text((x+20, 28), item, fill=GRAY, font=get_font(16))
    
    draw_rounded_rect(draw, [1700, 20, 1880, 60], 8, ACCENT)
    draw.text((1720, 28), "0x1234...5678", fill=WHITE, font=get_font(14))
    
    # Title
    draw.text((40, 120), "投资组合管理", fill=WHITE, font=get_font(32))
    
    # Table header
    draw_rounded_rect(draw, [40, 180, 1880, 240], 8, CARD_BG)
    headers = ["资产", "余额", "价值", "占比", "操作"]
    hx = [70, 500, 800, 1100, 1600]
    for h, x in zip(headers, hx):
        draw.text((x, 195), h, fill=GRAY, font=get_font(16))
    
    # Table rows
    assets = [
        ("xAU 代币化黄金", "5.2", "$50,000", "40%"),
        ("xRE 代币化房地产", "125", "$37,500", "30%"),
        ("xST 代币化股票", "500", "$25,000", "20%"),
        ("USDT 稳定币", "12,500", "$12,500", "10%"),
    ]
    for i, (name, bal, val, pct) in enumerate(assets):
        y = 260 + i * 60
        draw.rectangle([40, y, 1880, y+50], fill=CARD_BG if i%2==0 else BG)
        draw.text((70, y+15), name, fill=ACCENT, font=get_font(16))
        draw.text((500, y+15), bal, fill=WHITE, font=get_font(16))
        draw.text((800, y+15), val, fill=WHITE, font=get_font(16))
        draw.text((1100, y+15), pct, fill=WHITE, font=get_font(16))
        draw_rounded_rect(draw, [1600, y+10, 1720, y+40], 6, ACCENT)
        draw.text((1620, y+14), "移除", fill=WHITE, font=get_font(14))
    
    # Add asset form
    draw_rounded_rect(draw, [40, 520, 920, 800], 12, CARD_BG)
    draw.text((70, 540), "添加新资产", fill=WHITE, font=get_font(22))
    
    draw.text((70, 590), "资产合约地址", fill=GRAY, font=get_font(14))
    draw_rounded_rect(draw, [70, 620, 890, 660], 8, BG)
    draw.text((90, 630), "0x...", fill=GRAY, font=get_font(14))
    
    draw.text((70, 680), "数量", fill=GRAY, font=get_font(14))
    draw_rounded_rect(draw, [70, 710, 450, 750], 8, BG)
    draw.text((90, 720), "0.00", fill=GRAY, font=get_font(14))
    
    draw.text((500, 680), "目标配置比例 (%)", fill=GRAY, font=get_font(14))
    draw_rounded_rect(draw, [500, 710, 890, 750], 8, BG)
    draw.text((520, 720), "0", fill=GRAY, font=get_font(14))
    
    draw_rounded_rect(draw, [70, 770, 250, 800], 8, ACCENT)
    draw.text((110, 775), "添加资产", fill=WHITE, font=get_font(16))
    
    return img

def create_ai_strategy():
    """创建AI Strategy界面"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)
    
    # Header
    draw.rectangle([0, 0, WIDTH, 80], fill=(17, 17, 17))
    draw.text((40, 25), "AI-RWA Optimizer", fill=ACCENT, font=get_font(24))
    
    nav_items = ["仪表盘", "投资组合", "AI策略", "自动支付"]
    for i, item in enumerate(nav_items):
        x = 400 + i * 150
        if i == 2:
            draw_rounded_rect(draw, [x, 20, x+120, 60], 8, ACCENT)
            draw.text((x+30, 28), item, fill=WHITE, font=get_font(16))
        else:
            draw.text((x+30, 28), item, fill=GRAY, font=get_font(16))
    
    draw_rounded_rect(draw, [1700, 20, 1880, 60], 8, ACCENT)
    draw.text((1720, 28), "0x1234...5678", fill=WHITE, font=get_font(14))
    
    # Left panel - Parameters
    draw_rounded_rect(draw, [40, 120, 920, 600], 12, CARD_BG)
    draw.text((70, 140), "策略参数设置", fill=WHITE, font=get_font(22))
    
    draw.text((70, 200), "风险承受能力", fill=GRAY, font=get_font(14))
    draw.rectangle([70, 240, 890, 250], fill=(40, 40, 60))
    draw.rectangle([70, 240, 480, 250], fill=ACCENT)
    draw.text((250, 260), "平衡 (5/10)", fill=ACCENT, font=get_font(14))
    
    draw.text((70, 310), "投资期限（天）", fill=GRAY, font=get_font(14))
    draw_rounded_rect(draw, [70, 340, 440, 380], 8, BG)
    draw.text((90, 350), "90", fill=WHITE, font=get_font(16))
    
    draw.text((500, 310), "目标收益率（%）", fill=GRAY, font=get_font(14))
    draw_rounded_rect(draw, [500, 340, 890, 380], 8, BG)
    draw.text((520, 350), "10", fill=WHITE, font=get_font(16))
    
    draw_rounded_rect(draw, [70, 420, 350, 470], 8, ACCENT)
    draw.text((130, 430), "生成AI策略", fill=WHITE, font=get_font(18))
    
    # Right panel - Results
    draw_rounded_rect(draw, [960, 120, 1880, 600], 12, CARD_BG)
    draw.text((990, 140), "AI生成策略", fill=WHITE, font=get_font(22))
    
    # Metrics
    metrics = [("8.5%", "预期年化收益"), ("45", "风险评分"), ("87%", "AI置信度")]
    for i, (val, label) in enumerate(metrics):
        x = 1000 + i * 280
        draw.text((x+60, 200), val, fill=ACCENT, font=get_font(36))
        draw.text((x+30, 260), label, fill=GRAY, font=get_font(14))
    
    # Allocation bar
    draw.text((990, 320), "建议资产配置", fill=WHITE, font=get_font(16))
    draw.rectangle([990, 360, 1850, 400], fill=GREEN)
    draw.rectangle([1410, 360, 1850, 400], fill=ORANGE)
    draw.text((1150, 365), "60% 稳定资产", fill=WHITE, font=get_font(14))
    draw.text((1550, 365), "40% 风险资产", fill=WHITE, font=get_font(14))
    
    draw_rounded_rect(draw, [990, 430, 1850, 480], 8, ACCENT)
    draw.text((1350, 440), "执行此策略", fill=WHITE, font=get_font(18))
    
    return img

os.makedirs("demo/frames", exist_ok=True)

print("Creating Dashboard...")
create_dashboard().save("demo/frames/scene1.png")

print("Creating Portfolio...")
create_portfolio().save("demo/frames/scene2.png")

print("Creating AI Strategy...")
create_ai_strategy().save("demo/frames/scene3.png")

print("Done!")