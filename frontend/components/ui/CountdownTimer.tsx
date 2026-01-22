"use client";

import React, { useState, useEffect } from "react";
import { theme } from "@/lib/theme";

interface CountdownTimerProps {
  targetDate: Date;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {timeUnits.map((unit, index) => (
        <div
          key={index}
          className={`text-center p-3 rounded-xl bg-gradient-to-br ${theme.colors.gradients.primary} text-white shadow-lg ${theme.colors.shadows.primary}`}
        >
          <div className="text-2xl sm:text-3xl font-bold">
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-xs sm:text-sm opacity-90 mt-1">{unit.label}</div>
        </div>
      ))}
    </div>
  );
};
