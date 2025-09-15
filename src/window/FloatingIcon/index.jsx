import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { useConfig } from '../../hooks/useConfig';
import './style.css';

// 悬浮图标组件
export default function FloatingIcon() {
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    const [isMenuHovered, setIsMenuHovered] = useState(false);
    const [displayIconType] = useConfig('display_icon_type', 'menubar');
    const hideMenuTimer = React.useRef(null);

    // 判断是否是专用窗口
    const isFloatingIconWindow = appWindow?.label === 'floating_icon';

    // 当显示图标类型不是悬浮图标且当前也不是悬浮窗口时，不渲染组件
    if (!isFloatingIconWindow && displayIconType !== 'floating') {
        return null;
    }

    // 清除定时器
    const clearHideTimer = () => {
        if (hideMenuTimer.current) {
            clearTimeout(hideMenuTimer.current);
            hideMenuTimer.current = null;
        }
    };

    // 处理图标鼠标移入事件
    const handleIconMouseEnter = () => {
        setIsHovered(true);
        clearHideTimer();
        // 鼠标移入时显示菜单栏
        setIsMenuExpanded(true);
    };

    // 处理图标鼠标移出事件
    const handleIconMouseLeave = () => {
        // 鼠标移出时图标保持高亮状态，延迟隐藏菜单
        clearHideTimer();
        hideMenuTimer.current = setTimeout(() => {
            if (!isMenuHovered) {
                setIsMenuExpanded(false);
                setIsHovered(false);
            }
        }, 200);
    };

    // 处理菜单鼠标移入事件
    const handleMenuMouseEnter = () => {
        setIsMenuHovered(true);
        clearHideTimer();
    };

    // 处理菜单鼠标移出事件
    const handleMenuMouseLeave = () => {
        setIsMenuHovered(false);
        clearHideTimer();
        hideMenuTimer.current = setTimeout(() => {
            setIsMenuExpanded(false);
            setIsHovered(false);
        }, 200);
    };

    // 处理点击事件
    const handleClick = () => {
        clearHideTimer();
        setIsMenuExpanded(!isMenuExpanded);
    };

    // 组件卸载时清除定时器
    useEffect(() => {
        return () => {
            clearHideTimer();
        };
    }, []);

    // 打开配置窗口
    const openConfig = async () => {
        try {
            await invoke('open_config_window');
        } catch (error) {
            console.error('Failed to open config window:', error);
        }
    };

    // 打开翻译窗口
    const openTranslate = async () => {
        try {
            await invoke('open_translate_window');
        } catch (error) {
            console.error('Failed to open translate window:', error);
        }
    };

    // 执行OCR识别
    const performOCR = async () => {
        try {
            await invoke('perform_ocr_recognize');
        } catch (error) {
            console.error('Failed to perform OCR:', error);
        }
    };

    // 执行截图翻译
    const performScreenshotTranslate = async () => {
        try {
            await invoke('perform_screenshot_translate');
        } catch (error) {
            console.error('Failed to perform screenshot translate:', error);
        }
    };

    return (
        <div className="floating-icon-container">
            {/* 主悬浮图标 */}
            <div
                className={`floating-icon ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={handleIconMouseEnter}
                onMouseLeave={handleIconMouseLeave}
                onClick={handleClick}
            >
                {/* 应用图标 */}
                <div className="icon-content">
                    <img src="/icon.svg" alt="Pot" width="28" height="28" />
                </div>
            </div>

            {/* 菜单栏 */}
            {isMenuExpanded && (
                <div 
                    className="floating-menu"
                    onMouseEnter={handleMenuMouseEnter}
                    onMouseLeave={handleMenuMouseLeave}
                >
                    <div className="menu-item" onClick={openConfig}>
                        <span className="menu-icon">⚙️</span>
                        <span className="menu-text">设置</span>
                    </div>
                    <div className="menu-item" onClick={openTranslate}>
                        <span className="menu-icon">🌐</span>
                        <span className="menu-text">翻译</span>
                    </div>
                    <div className="menu-item" onClick={performOCR}>
                        <span className="menu-icon">📝</span>
                        <span className="menu-text">识别</span>
                    </div>
                    <div className="menu-item" onClick={performScreenshotTranslate}>
                        <span className="menu-icon">📷</span>
                        <span className="menu-text">截图翻译</span>
                    </div>
                </div>
            )}
        </div>
    );
}