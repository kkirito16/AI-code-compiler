import React, { useState, useEffect } from 'react';

const Carousel = () => {
    const images = [
        './assets/1.jpg',
        './assets/2.jpg',
        './assets/3.jpg',
        './assets/4.jpg',
        './assets/5.jpg',
        './assets/6.jpg'
    ];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dots, setDots] = useState([]);

    useEffect(() => {
        const newDots = images.map((_, index) => ({
            isActive: index === 0,
            index: index
        }));
        setDots(newDots);

        const intervalId = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [images]);

    useEffect(() => {
        const newDotsCopy = [...dots];
        newDotsCopy.forEach((dot) => dot.isActive = false);
        if (currentIndex < newDotsCopy.length) {
            newDotsCopy[currentIndex].isActive = true;
        }
        setDots(newDotsCopy);
    }, [currentIndex, dots]);

    const handleDotClick = (index) => {
        setCurrentIndex(index);
    };

    // 新增 useEffect 监听 currentIndex 变化，更新图片显示状态
    useEffect(() => {
        const imagesElements = document.querySelectorAll('.carousel-image');
        imagesElements.forEach((image, index) => {
            if (index === currentIndex) {
                image.style.opacity = '1';
            } else {
                image.style.opacity = '0';
            }
        });
    }, [currentIndex]);

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f5f5f5',
            margin: 0,
            padding: '20px',
            textAlign: 'center',
            width: '300px',
            height: '400px'
        }}>
            <div style={{
                position: 'relative',
                width: '80%',
                margin: 'auto',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                height: '300px',
                width: '240px'
            }}>
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                }}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                opacity: index === currentIndex ? 1 : 0,
                                transition: 'opacity 1s ease',
                                // 添加类名，方便在 useEffect 中选择元素
                                className: 'carousel-image'
                            }}
                        >
                            <img
                                src={image}
                                alt={`Image ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '10px',
                                    display: 'block'
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                zIndex: 1
            }}>
                {dots.map((dot) => (
                    <span
                        key={dot.index}
                        style={{
                            display: 'inline-block',
                            width: '10px',
                            height: '10px',
                            margin: '0 5px',
                            borderRadius: '50%',
                            backgroundColor: dot.isActive ? '#717171' : '#bbb',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleDotClick(dot.index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;