import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  SiNotion,
  SiMiro,
  SiTodoist,
  SiClickup,
  SiJira,
  SiSlack,
} from "react-icons/si";

// Tool data with icons and names
const tools = [
  { name: "Jira", icon: SiJira, color: "#0052CC" },
  { name: "Notion", icon: SiNotion, color: "#000000" },
  { name: "Miro", icon: SiMiro, color: "#FFD02F" },
  { name: "Todoist", icon: SiTodoist, color: "#E44332" },
  { name: "Slack", icon: SiSlack, color: "#4A154B" },
  { name: "ClickUp", icon: SiClickup, color: "#7B68EE" },
];

// Define types for the AnimatedArrow props
interface AnimatedArrowProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

// Arrow component with animated dots
const AnimatedArrow: React.FC<AnimatedArrowProps> = ({
  startX,
  startY,
  endX,
  endY,
  delay,
}) => {
  const midX = (startX + endX) / 2;
  const curveOffsetY = -30;
  const path = `M${startX},${startY} Q${midX},${startY + curveOffsetY} ${endX},${endY}`;

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
      <path
        d={path}
        fill="none"
        stroke="rgba(209, 213, 219, 0.5)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle
            r={3}
            fill="var(--color-primary)"
            filter="drop-shadow(0 0 2px rgba(99, 102, 241, 0.6))"
          >
            <animateMotion
              path={path}
              dur="3s"
              begin={`${delay + i * 0.5}s`}
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>
        </g>
      ))}
      <polygon
        points={`${endX - 5},${endY - 5} ${endX},${endY} ${endX - 5},${endY + 5}`}
        fill="rgba(209, 213, 219, 0.7)"
        transform={`rotate(${Math.atan2(endY - (startY + curveOffsetY), endX - midX) * (180 / Math.PI)}, ${endX}, ${endY})`}
      />
    </svg>
  );
};

const Replacement = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const toolRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const [toolPositions, setToolPositions] = React.useState<
    { x: number; y: number }[]
  >([]);

  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const positions = toolRefs.current.map((ref) => {
      if (!ref) return { x: 0, y: 0 };
      const rect = ref.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      };
    });
    setToolPositions(positions);
  }, [dimensions]);

  return (
    <div className="w-full py-16 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Replace Multiple Tools with Proddy
        </h2>

        <div
          ref={containerRef}
          className="relative h-[400px] md:h-[500px] w-full"
        >
          {/* Left: Tools */}
          <div className="z-30 absolute left-0 top-1/2 transform -translate-y-1/2 w-1/3 flex flex-col items-center space-y-4 md:space-y-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.name}
                ref={(el) => {
                  toolRefs.current[index] = el;
                }}
                className="flex items-center p-3 rounded-lg shadow-md bg-white dark:bg-gray-800"
                initial={{ x: -50, opacity: 0 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
              >
                <motion.div>
                  <tool.icon size={24} color={tool.color} className="mr-2" />
                </motion.div>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {tool.name}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Arrows */}
          {dimensions.width > 0 &&
            toolPositions.length === tools.length &&
            tools.map((tool, index) => {
              const { x, y } = toolPositions[index];
              const endX = dimensions.width * 0.75;
              const endY = dimensions.height / 2;
              return (
                <AnimatedArrow
                  key={`arrow-${tool.name}`}
                  startX={x}
                  startY={y}
                  endX={endX}
                  endY={endY}
                  delay={index * 0.2}
                />
              );
            })}

          {/* Right: Proddy */}
          <motion.div
            className="absolute right-[5%] top-[35%] w-[30%] flex justify-center z-30"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="bg-primary text-white p-6 md:p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo-white.png"
                    alt="Proddy Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Simplify your workflow by replacing multiple tools with a single
            powerful platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Replacement;
