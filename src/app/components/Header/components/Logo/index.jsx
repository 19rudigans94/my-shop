import React from "react";
import Link from "next/link";
import { styles } from "./styles";

export const Logo = () => {
  return (
    <Link href="/games" className={styles.container}>
      <span className={styles.text}>GoldGames</span>
    </Link>
  );
};

export default Logo;
