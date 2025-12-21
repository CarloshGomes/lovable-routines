import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.svg';

interface InteractiveLogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const InteractiveLogo = ({ className, size = 'md' }: InteractiveLogoProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse position values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for rotation
    const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

    // Transform mouse position to rotation degrees
    // Range: -20 to 20 degrees
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ['20deg', '-20deg']);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-20deg', '20deg']);

    // Dynamic light effect based on rotation
    const sheenX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
    const sheenY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();

        // Calculate normalized position (-0.5 to 0.5) from center
        const width = rect.width;
        const height = rect.height;
        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;

        const xPct = (mouseXPos / width) - 0.5;
        const yPct = (mouseYPos / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    };

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16"
    };

    return (
        <motion.div
            ref={ref}
            className={cn("relative perspective-1000", sizeClasses[size], className)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000
            }}
        >
            <motion.div
                className="w-full h-full relative"
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Background Depth Layer */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl blur-sm transform translate-z-[-10px]"
                    style={{ transform: "translateZ(-10px)" }}
                />

                {/* Glass Container */}
                <div className="absolute inset-0 bg-card/10 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden flex items-center justify-center">

                    {/* Dynamic Sheen/Lighting */}
                    <motion.div
                        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        style={{
                            background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                            zIndex: 10
                        }}
                    />

                    {/* Logo Image Layer - Pops out */}
                    <div
                        className="relative z-20 transform-style-3d text-primary"
                        style={{ transform: "translateZ(20px)" }}
                    >
                        <img
                            src={logoImage}
                            alt="Logo"
                            className="w-[70%] h-[70%] object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] mx-auto my-auto"
                        />
                    </div>

                    {/* Inner Border/Glow */}
                    <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none mix-blend-overlay" />
                </div>
            </motion.div>
        </motion.div>
    );
};
