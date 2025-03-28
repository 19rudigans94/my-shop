import { Gamepad2, MessageSquare, Cable, Joystick } from "lucide-react";

export const navigationConfig = [
  {
    href: "/contact",
    label: "Обратная связь",
    icon: MessageSquare,
    text: "Информация",
    // submenu: [
    //   { href: "/contact", text: "О нас" },
    //   { href: "/contact/feedback", text: "Обратная связь" },
    //   { href: "/contact/agreement", text: "Пользовательское соглашение" },
    // ],
  },
  {
    href: "/accessories",
    label: "Аксессуары",
    icon: Cable,
    text: "Аксессуары",
  },
  {
    href: "/games",
    label: "Игры",
    icon: Gamepad2,
    text: "Игры",
  },
  {
    href: "/consoles",
    label: "Консоли",
    icon: Joystick,
    text: "Консоли",
  },
];
