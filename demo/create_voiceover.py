#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用edge-tts生成中文讲解音频
"""
import edge_tts
import asyncio
import subprocess
import os

# 配置
VOICE = "zh-CN-YunxiNeural"  # 男声
RATE = "+0%"  # 语速
VOLUME = "+0%"  # 音量

# 场景和对应的讲解文本
scenes = [
    {
        "name": "scene1_title",
        "text": "AI-RWA Portfolio Optimizer，智能投资组合优化器。",
        "start": 0,
        "duration": 5
    },
    {
        "name": "scene2_dashboard",
        "text": "这是我们的投资组合仪表盘。在这里，您可以实时监控投资组合表现，查看总资产价值、日收益和周收益。AI会根据市场情况给出智能建议，帮助您优化资产配置。",
        "start": 5,
        "duration": 10
    },
    {
        "name": "scene3_portfolio",
        "text": "在投资组合管理页面，您可以轻松管理多种真实世界资产。支持代币化的黄金、房地产和股票。一键添加新资产，设置目标配置比例，系统会自动执行再平衡。",
        "start": 15,
        "duration": 10
    },
    {
        "name": "scene4_ai_strategy",
        "text": "AI策略生成器根据您的风险偏好，自动生成最优投资策略。设置风险等级、投资期限和目标收益率，AI会计算预期收益、风险评分，并给出资产配置建议。一键即可执行策略。",
        "start": 25,
        "duration": 10
    },
    {
        "name": "scene5_results",
        "text": "项目成果：我们开发了8个智能合约，29个测试全部通过，提供完整的API文档。基于HSK Chain构建，集成Chainlink Oracle获取真实价格数据。",
        "start": 35,
        "duration": 10
    },
    {
        "name": "scene6_cta",
        "text": "AI-RWA Portfolio Optimizer，让投资更智能。立即体验我们的产品。",
        "start": 45,
        "duration": 5
    }
]

async def generate_voiceover():
    """生成所有场景的讲解音频"""
    os.makedirs("demo/audio", exist_ok=True)
    
    for scene in scenes:
        print(f"生成音频: {scene['name']}...")
        
        communicate = edge_tts.Communicate(
            text=scene["text"],
            voice=VOICE,
            rate=RATE,
            volume=VOLUME
        )
        
        output_file = f"demo/audio/{scene['name']}.mp3"
        await communicate.save(output_file)
        print(f"  保存到: {output_file}")
    
    print("所有音频生成完成！")

def create_silence(duration_sec, output_file):
    """创建静音音频"""
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=mono",
        "-t", str(duration_sec),
        "-c:a", "aac", "-b:a", "128k",
        output_file
    ]
    subprocess.run(cmd, capture_output=True)

def main():
    print("=== 生成讲解音频 ===")
    
    # 生成TTS音频
    asyncio.run(generate_voiceover())
    
    print("\n=== 创建时间轴 ===")
    
    # 为每个场景创建带时间戳的音频
    timeline = []
    
    for scene in scenes:
        audio_file = f"demo/audio/{scene['name']}.mp3"
        if os.path.exists(audio_file):
            # 获取音频时长
            cmd = [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                audio_file
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            duration = float(result.stdout.strip())
            
            timeline.append({
                "file": audio_file,
                "start": scene["start"],
                "duration": duration,
                "scene_duration": scene["duration"]
            })
            
            print(f"  {scene['name']}: {duration:.1f}s (场景{scene['duration']}s)")
    
    # 创建静音填充和音频拼接
    print("\n=== 合并音频 ===")
    
    # 为每个场景创建带时间戳的音频
    audio_parts = []
    for i, item in enumerate(timeline):
        # 创建带延迟的音频
        padded_file = f"demo/audio/padded_{i}.mp3"
        delay_ms = int(item["start"] * 1000)
        
        cmd = [
            "ffmpeg", "-y",
            "-i", item["file"],
            "-af", f"adelay={delay_ms}|{delay_ms}",
            "-t", str(item["scene_duration"]),
            padded_file
        ]
        subprocess.run(cmd, capture_output=True)
        audio_parts.append(padded_file)
    
    # 合并所有音频
    filter_parts = []
    for i in range(len(audio_parts)):
        filter_parts.append(f"[{i}:a]")
    
    filter_str = "".join(filter_parts) + f"amix=inputs={len(audio_parts)}:duration=longest[out]"
    
    # 创建文件列表
    with open("demo/audio/filelist.txt", "w") as f:
        for part in audio_parts:
            f.write(f"file '{part}'\n")
    
    # 使用concat合并
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", "demo/audio/filelist.txt",
        "-c:a", "aac", "-b:a", "192k",
        "demo/audio/narration.m4a"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("讲解音频已保存到: demo/audio/narration.m4a")
    else:
        print(f"合并失败: {result.stderr[-200:]}")
    
    # 清理临时文件
    for part in audio_parts:
        if os.path.exists(part):
            os.remove(part)
    
    print("完成！")

if __name__ == "__main__":
    main()