import { Gamepad2, MessageSquare, Cable, Joystick } from "lucide-react";
import React from "react";

const linkItems = [
  {
    href: "/contact",
    label: "Обратная связь",
    icon: <MessageSquare size={24} />,
    text: "Обратная связь",
  },
  {
    href: "/accessories",
    label: "Аксессуары",
    icon: <Cable size={24} />,
    text: "Аксессуары",
  },
  {
    href: "/games",
    label: "Игры",
    icon: <Gamepad2 size={24} />,
    text: "Игры",
  },
  {
    href: "/console",
    label: "Консоли",
    icon: <Joystick size={24} />,
    text: "Консоли",
  },
];

export default linkItems;
