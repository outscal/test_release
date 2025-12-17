"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { cn } from "../../../../lib/utils";

export interface PlayButtonProps {
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
  className?: string;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  onClick,
  size = "md",
  showText = false,
  text = "Play",
  className,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          button: "h-16 w-16",
          icon: "h-6 w-6",
          text: "text-lg",
        };
      case "md":
        return {
          button: "h-24 w-24",
          icon: "h-10 w-10",
          text: "text-xl",
        };
      case "lg":
        return {
          button: "h-32 w-32",
          icon: "h-14 w-14",
          text: "text-2xl",
        };
      default:
        return {
          button: "h-24 w-24",
          icon: "h-10 w-10",
          text: "text-xl",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.button
        onClick={onClick}
        className="group relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 blur-xl opacity-70 group-hover:opacity-100"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Button container */}
        <div className={cn(
          "relative flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-2xl",
          sizeClasses.button
        )}>
          {/* Inner circle */}
          <div className="absolute inset-1 rounded-full bg-slate-900" />

          {/* Play icon */}
          <IconPlayerPlayFilled className={cn("relative z-10 text-white", sizeClasses.icon)} />
        </div>
      </motion.button>

      {/* Play text */}
      {showText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn("mt-6 font-semibold text-white", sizeClasses.text)}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default PlayButton;